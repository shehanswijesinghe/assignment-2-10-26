'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductWizard } from '@/components/admin/product-wizard';
import { apiCall } from '@/lib/api/handler';
import { adminApi } from '@/lib/api/services';
import type { AdminProduct } from '@/lib/api/types';
import { useT } from '@/lib/i18n';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useT();
  const [product, setProduct] = useState<AdminProduct>();

  useEffect(() => {
    apiCall(adminApi.product(id), { toastSuccess: false })
      .then((r) => (!r.data || r.data.status === 'deleted' ? router.replace('/admin/products') : setProduct(r.data)))
      .catch(() => router.replace('/admin/products'));
  }, [id, router]);

  return product ? <ProductWizard product={product} /> : <p className="text-muted-foreground">{t('common.loading')}</p>;
}
