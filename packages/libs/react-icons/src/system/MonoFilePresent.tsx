import type { SVGProps } from 'react';
import * as React from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const MonoFilePresent = (
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
    <path d="M15 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7zM6 20V4h8v4h4v12zm10-10v5c0 2.21-1.79 4-4 4s-4-1.79-4-4V8.5a2.5 2.5 0 0 1 2.76-2.49c1.3.13 2.24 1.32 2.24 2.63V15h-2V8.5c0-.28-.22-.5-.5-.5s-.5.22-.5.5V15c0 1.1.9 2 2 2s2-.9 2-2v-5z" />
  </svg>
);
export default MonoFilePresent;