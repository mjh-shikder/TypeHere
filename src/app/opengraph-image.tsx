import { renderSocialPreviewImage } from '@/lib/social-image';

export const alt = 'TypeHere — Free Online Typing Test & WPM Speed Practice';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return renderSocialPreviewImage();
}
