import type { SVGProps } from 'react';
import * as React from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const MonoSensorsOff = (
  { title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps,
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-style="mono"
    viewBox="0 0 24 24"
    fontSize="1.5em"
    fill="currentColor"
    height="1em"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M8.14 10.96c-.09.33-.14.68-.14 1.04 0 1.1.45 2.1 1.17 2.83l-1.42 1.42A6.02 6.02 0 0 1 6 12c0-.93.21-1.8.58-2.59L5.11 7.94A7.9 7.9 0 0 0 4 12c0 2.21.9 4.21 2.35 5.65l-1.42 1.42A9.97 9.97 0 0 1 2 12c0-2.04.61-3.93 1.66-5.51L1.39 4.22 2.8 2.81l18.38 18.38-1.41 1.41zm9.28 3.63c.37-.79.58-1.66.58-2.59 0-1.66-.67-3.16-1.76-4.24l-1.42 1.42a3.95 3.95 0 0 1 1.04 3.86zM20 12c0 1.48-.4 2.87-1.11 4.06l1.45 1.45A9.9 9.9 0 0 0 22 12c0-2.76-1.12-5.26-2.93-7.07l-1.42 1.42A7.94 7.94 0 0 1 20 12" />
  </svg>
);
export default MonoSensorsOff;