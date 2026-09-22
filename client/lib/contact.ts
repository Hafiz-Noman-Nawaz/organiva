export const WHATSAPP_RAW_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923156251281';

const rawClean = WHATSAPP_RAW_NUMBER.replace(/[^0-9]/g, '');
export const WHATSAPP_FORMATTED_NUMBER = rawClean.length === 12 && rawClean.startsWith('92')
  ? `+92 ${rawClean.slice(2, 5)} ${rawClean.slice(5)}`
  : `+${rawClean}`;

export const getWhatsAppUrl = (message: string = 'Hi Organiva! I have a question about your home organizers.'): string => {
  const cleanPhone = WHATSAPP_RAW_NUMBER.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
