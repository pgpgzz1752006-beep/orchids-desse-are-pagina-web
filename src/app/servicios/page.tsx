import { Metadata } from 'next'
import ServiciosContent from './ServiciosContent'

export const metadata: Metadata = {
  title: 'Servicios | Diseñare Promocionales',
  description:
    'Conoce nuestros servicios de personalización, grabado láser, serigrafía, sublimación, bordado y distribución de artículos promocionales en todo México.',
}

export default function ServiciosPage() {
  return <ServiciosContent />
}
