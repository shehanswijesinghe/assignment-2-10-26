'use client';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { CategoryCombobox, CategoryValue } from '@/components/category-combobox';
import { ProductStatusBadge } from '@/components/product-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiCall } from '@/lib/api/handler';
import { adminApi, filesApi, ProductBody } from '@/lib/api/services';
import type { AdminProduct } from '@/lib/api/types';
import { MAX_PRODUCT_IMAGES } from '@/lib/constants';
import { fieldError } from '@/lib/form';
import { translateCode, useT } from '@/lib/i18n';
import { AVATAR_ACCEPT, AVATAR_MAX_KB, imageUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3;
interface ImageRef { baseUrl: string; folder: string; name: string; isNew: boolean }

function autoMeta(name: string, category: string, description: string) {
  const n = name.trim();
  const words = n.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2);
  return {
    title: n.slice(0, 70),
    description: (description.trim() || (category ? `${n} - ${category}` : n)).replace(/\s+/g, ' ').slice(0, 160),
    keywords: Array.from(new Set([...words, ...(category ? [category.toLowerCase()] : [])])).join(', ').slice(0, 255),
  };
}

const stepOf = (field: string): Step => (field.startsWith('meta') ? 2 : field.startsWith('images') ? 3 : 1);

export function ProductWizard({ product }: { product?: AdminProduct }) {
  const { t } = useT();
  const router = useRouter();
  const editing = !!product;
  const fileInput = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState<CategoryValue | null>(product?.category ?? null);
  const [price, setPrice] = useState(product?.price != null ? String(product.price) : '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [metaTitle, setMetaTitle] = useState(product?.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(product?.metaDescription ?? '');
  const [metaKeywords, setMetaKeywords] = useState(product?.metaKeywords ?? '');
  const edited = useRef({ title: !!product?.metaTitle, description: !!product?.metaDescription, keywords: !!product?.metaKeywords });
  const [images, setImages] = useState<ImageRef[]>(product?.images.map((i) => ({ ...i, isNew: false })) ?? []);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string>();
  const [error, setError] = useState<unknown>();
  const [saving, setSaving] = useState(false);

  const nameOk = name.trim().length > 0 && name.trim().length <= 150;
  const priceOk = /^\d{1,8}(\.\d{1,2})?$/.test(price.trim()) && Number(price) >= 0.01;
  const step1Valid = nameOk && priceOk;
  const canSave = step1Valid && images.length >= 1;
  const priceHint = price.trim() !== '' && !priceOk
    ? (/^\d+(\.\d{3,})$/.test(price.trim()) ? translateCode('validation.number.decimals') : translateCode('validation.number.min', { min: 0.01 }))
    : undefined;

  function goTo(target: Step) {
    if (target === step) return;
    if (target > step && !step1Valid) return;
    if (target >= 2 && step === 1) {
      const auto = autoMeta(name, category?.name ?? '', description);
      if (!edited.current.title) setMetaTitle(auto.title);
      if (!edited.current.description) setMetaDescription(auto.description);
      if (!edited.current.keywords) setMetaKeywords(auto.keywords);
    }
    setStep(target);
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    setImageError(undefined);
    const room = MAX_PRODUCT_IMAGES - images.length;
    if (files.length > room) setImageError(translateCode('validation.images.max', { max: MAX_PRODUCT_IMAGES }));
    setUploading(true);
    try {
      for (const file of files.slice(0, Math.max(room, 0))) {
        if (!AVATAR_ACCEPT.split(',').includes(file.type)) { setImageError(translateCode('validation.file.type')); continue; }
        if (file.size > AVATAR_MAX_KB * 1024) { setImageError(translateCode('validation.file.max', { max: AVATAR_MAX_KB })); continue; }
        try {
          const res = await apiCall(filesApi.uploadProductImage(file, name.trim()), { toastSuccess: false });
          if (res.data) setImages((cur) => [...cur, { baseUrl: res.data!.baseUrl, folder: res.data!.folder, name: res.data!.name, isNew: true }]);
        } catch {}
      }
    } finally { setUploading(false); }
  }

  function removeImage(img: ImageRef) {
    setImages((cur) => cur.filter((i) => i.name !== img.name));
    if (img.isNew) filesApi.deleteProductImage(img.name).catch(() => {});
  }
  const makeMain = (img: ImageRef) => setImages((cur) => [img, ...cur.filter((i) => i.name !== img.name)]);

  async function save(kind: 'draft' | 'publish') {
    const status: ProductBody['status'] =
      kind === 'draft' ? 'draft' : !editing || product!.status === 'draft' ? 'active' : (product!.status as 'active' | 'deactivated');
    const body: ProductBody = {
      ...(editing ? {} : { name: name.trim() }),
      status,
      price: price.trim() || null,
      categoryId: category?.id ?? null,
      description: description.trim() || null,
      metaTitle: metaTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
      metaKeywords: metaKeywords.trim() || null,
      images: images.map(({ folder, name: n }) => ({ folder, name: n })),
    };
    setSaving(true); setError(undefined);
    try {
      if (editing) await apiCall(adminApi.updateProduct(product!.id, body));
      else await apiCall(adminApi.createProduct(body));
      router.push('/admin/products');
    } catch (err) {
      setError(err);
      const first = (err as { details?: { field: string }[] }).details?.[0];
      if (first) setStep(stepOf(first.field));
    } finally { setSaving(false); }
  }

  const imagesError = imageError ?? fieldError(error, 'images') ?? (error as { details?: { field: string; code: string; params?: Record<string, string | number> }[] } | undefined)?.details
    ?.filter((d) => d.field.startsWith('images.')).map((d) => translateCode(d.code, d.params))[0];
  const errorText = (field: string) => fieldError(error, field);
  const err = (field: string) => errorText(field) && <p className="text-xs text-destructive">{errorText(field)}</p>;
  const publishLabel = !editing || product!.status === 'draft' ? t('wizard.publish') : t('wizard.save');

  const steps: [Step, string][] = [[1, t('wizard.step1')], [2, t('wizard.step2')], [3, t('wizard.step3')]];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{editing ? t('wizard.editTitle') : t('wizard.addTitle')}</h1>
        {editing && <ProductStatusBadge status={product!.status} />}
      </div>

      <ol className="flex items-center gap-2">
        {steps.map(([n, label]) => (
          <li key={n} className="flex flex-1 items-center gap-2">
            <button type="button" onClick={() => goTo(n)} disabled={n > step && !step1Valid} aria-current={n === step ? 'step' : undefined}
              className={cn('flex items-center gap-2 rounded-md px-2 py-1 text-sm disabled:opacity-50', n === step ? 'font-medium' : 'text-muted-foreground')}>
              <span className={cn('flex size-6 items-center justify-center rounded-full border text-xs', n === step && 'bg-primary text-primary-foreground', n < step && 'bg-secondary')}>
                {n < step ? <Check className="size-3" /> : n}
              </span>
              {label}
            </button>
            {n < 3 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      <Card>
        <CardHeader><CardTitle className="text-lg">{steps[step - 1][1]}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">{t('wizard.name')} *</Label>
                <Input id="name" value={name} maxLength={150} disabled={editing} onChange={(e) => setName(e.target.value)} />
                {editing && <p className="text-xs text-muted-foreground">{t('wizard.nameLocked')}</p>}
                {err('name')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t('wizard.category')}</Label>
                <CategoryCombobox id="category" value={category} onChange={setCategory} />
                {err('categoryId')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">{t('wizard.price')} *</Label>
                <Input id="price" inputMode="decimal" value={price} placeholder="0.00" onChange={(e) => setPrice(e.target.value)} />
                {(priceHint || errorText('price')) && <p className="text-xs text-destructive">{priceHint ?? errorText('price')}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('wizard.description')}</Label>
                <textarea id="description" rows={5} maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                {err('description')}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">{t('wizard.metaHint')}</p>
              <div className="space-y-2">
                <Label htmlFor="metaTitle">{t('wizard.metaTitle')} <span className="text-xs text-muted-foreground">{metaTitle.length} / 70</span></Label>
                <Input id="metaTitle" value={metaTitle} maxLength={70} onChange={(e) => { edited.current.title = true; setMetaTitle(e.target.value); }} />
                {err('metaTitle')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">{t('wizard.metaDescription')} <span className="text-xs text-muted-foreground">{metaDescription.length} / 160</span></Label>
                <textarea id="metaDescription" rows={3} maxLength={160} value={metaDescription} onChange={(e) => { edited.current.description = true; setMetaDescription(e.target.value); }}
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                {err('metaDescription')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaKeywords">{t('wizard.metaKeywords')}</Label>
                <Input id="metaKeywords" value={metaKeywords} maxLength={255} onChange={(e) => { edited.current.keywords = true; setMetaKeywords(e.target.value); }} />
                {err('metaKeywords')}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-1">
                <Label>{t('wizard.images')} * <span className="text-xs text-muted-foreground">{images.length} / {MAX_PRODUCT_IMAGES}</span></Label>
                <p className="text-xs text-muted-foreground">{t('wizard.imagesHint', { max: MAX_PRODUCT_IMAGES })}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((img, i) => (
                  <div key={img.name} className="space-y-1 rounded-lg border p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl(img)!} alt="" className="aspect-square w-full rounded-md object-cover" />
                    <div className="flex flex-wrap items-center gap-1">
                      {i === 0
                        ? <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">{t('wizard.main')}</span>
                        : <Button type="button" variant="ghost" size="sm" onClick={() => makeMain(img)}>{t('wizard.setMain')}</Button>}
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(img)}>{t('wizard.remove')}</Button>
                    </div>
                  </div>
                ))}
              </div>
              <input ref={fileInput} type="file" multiple accept={AVATAR_ACCEPT} className="hidden" onChange={onFiles} />
              <Button type="button" variant="outline" disabled={uploading || images.length >= MAX_PRODUCT_IMAGES || !nameOk} onClick={() => fileInput.current?.click()}>
                {uploading ? t('profile.image.uploading') : t('wizard.upload')}
              </Button>
              {imagesError && <p className="text-xs text-destructive">{imagesError}</p>}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button asChild variant="ghost"><Link href="/admin/products">{t('common.cancel')}</Link></Button>
          {step > 1 && <Button type="button" variant="outline" onClick={() => goTo((step - 1) as Step)}>{t('wizard.back')}</Button>}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={!nameOk || saving || uploading} onClick={() => save('draft')}>{t('wizard.saveDraft')}</Button>
          {step < 3
            ? <Button type="button" disabled={(step === 1 && !step1Valid) || uploading} onClick={() => goTo((step + 1) as Step)}>{t('wizard.next')}</Button>
            : <Button type="button" disabled={!canSave || saving || uploading} onClick={() => save('publish')}>{saving ? t('common.saving') : publishLabel}</Button>}
        </div>
      </div>
    </div>
  );
}
