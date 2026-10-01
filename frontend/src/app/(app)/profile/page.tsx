'use client';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiCall } from '@/lib/api/handler';
import { filesApi, usersApi } from '@/lib/api/services';
import type { UploadedImage } from '@/lib/api/types';
import { fieldError } from '@/lib/form';
import { translateCode, useT } from '@/lib/i18n';
import { AVATAR_ACCEPT, AVATAR_MAX_KB, imageUrl } from '@/lib/media';
import { useAuthStore } from '@/store/auth';

export default function ProfilePage() {
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const fileInput = useRef<HTMLInputElement>(null);
  const [firstName, setFirst] = useState(user?.firstName ?? '');
  const [lastName, setLast] = useState(user?.lastName ?? '');
  const [pending, setPending] = useState<UploadedImage | null>(null);
  const [removed, setRemoved] = useState(false);
  const [imageError, setImageError] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<unknown>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiCall(usersApi.me(), { toastSuccess: false }).then((r) => {
      if (r.data) { setUser(r.data); setFirst(r.data.firstName); setLast(r.data.lastName); }
    }).catch(() => {});
  }, [setUser]);

  if (!user) return null;
  const preview = removed ? null : (pending?.url ?? imageUrl(user.profileImage));

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageError(undefined);
    if (!AVATAR_ACCEPT.split(',').includes(file.type)) return setImageError(translateCode('validation.file.type'));
    if (file.size > AVATAR_MAX_KB * 1024) return setImageError(translateCode('validation.file.max', { max: AVATAR_MAX_KB }));

    setUploading(true);
    try {
      const previous = pending;
      const res = await apiCall(filesApi.uploadProfileImage(file));
      setPending(res.data);
      setRemoved(false);
      if (previous) filesApi.deleteProfileImage(previous.name).catch(() => {});
    } catch {} finally { setUploading(false); }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(undefined);
    try {
      const profileImage = pending ? { folder: pending.folder, name: pending.name } : removed ? null : undefined;
      const r = await apiCall(usersApi.updateMe({ firstName, lastName, ...(profileImage !== undefined && { profileImage }) }));
      if (r.data) setUser(r.data);
      setPending(null); setRemoved(false);
    } catch (err) { setError(err); } finally { setSaving(false); }
  }

  return (
    <main className="mx-auto w-full max-w-xl p-6">
      <Card>
        <CardHeader><CardTitle className="text-xl">{t('profile.title')}</CardTitle><CardDescription>{t('profile.description')}</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('profile.image.title')}</Label>
              <div className="flex items-center gap-4">
                <Avatar user={user} src={preview} className="size-20 text-xl" />
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input ref={fileInput} type="file" accept={AVATAR_ACCEPT} className="hidden" onChange={onFile} />
                    <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInput.current?.click()}>
                      {uploading ? t('profile.image.uploading') : preview ? t('profile.image.change') : t('profile.image.choose')}
                    </Button>
                    {preview && <Button type="button" variant="ghost" size="sm" disabled={uploading} onClick={() => { setPending(null); setRemoved(true); }}>{t('profile.image.remove')}</Button>}
                  </div>
                  <p className="text-xs text-muted-foreground">{t('profile.image.hint')}</p>
                </div>
              </div>
              {(imageError || fieldError(error, 'profileImage')) && <p className="text-xs text-destructive">{imageError ?? fieldError(error, 'profileImage')}</p>}
            </div>
            <div className="space-y-2"><Label htmlFor="email">{t('auth.email')}</Label><Input id="email" value={user.email} disabled /></div>
            <div className="space-y-2"><Label htmlFor="firstName">{t('auth.firstName')}</Label>
              <Input id="firstName" required value={firstName} onChange={(e) => setFirst(e.target.value)} />
              {fieldError(error, 'firstName') && <p className="text-xs text-destructive">{fieldError(error, 'firstName')}</p>}</div>
            <div className="space-y-2"><Label htmlFor="lastName">{t('auth.lastName')}</Label>
              <Input id="lastName" required value={lastName} onChange={(e) => setLast(e.target.value)} />
              {fieldError(error, 'lastName') && <p className="text-xs text-destructive">{fieldError(error, 'lastName')}</p>}</div>
            <Button type="submit" disabled={saving || uploading}>{saving ? t('common.saving') : t('common.save')}</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
