import { fallbackVar } from '@vanilla-extract/css';
import { recipe, style, token, uiSmallRegular } from '../../../styles';

const maxWidth = fallbackVar('100%');

export const labelClass = style([
  {
    display: 'flex',
    color: token('color.text.base.default'),
    alignItems: 'flex-start',
    lineHeight: token('size.n4'),
    cursor: 'pointer',
    gap: token('size.n2'),
    transition: 'color 0.2s ease',
    maxWidth: maxWidth,
    selectors: {
      '&[data-disabled="true"]': {
        cursor: 'not-allowed',
        color: token('color.text.base.@disabled'),
      },
      '&[data-inversed="true"]': {
        color: token('color.text.base.inverse.default'),
      },
      '&[data-readonly="true"]': {
        cursor: 'unset',
      },
    },
  },
  uiSmallRegular,
]);

export const boxClass = style({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: token('radius.xs'),
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: token('color.border.base.bold'),
  backgroundColor: token('color.background.input.default'),
  transition: 'background-color 0.2s, border-color 0.2s',
  width: token('size.n4'),
  height: token('size.n4'),
  minWidth: token('size.n4'),
  minHeight: token('size.n4'),
  selectors: {
    // hovered
    [`${labelClass}[data-hovered="true"] &`]: {
      backgroundColor: token('color.background.input.@hover'),
    },
    // focused
    [`${labelClass}[data-focus-visible="true"] &`]: {
      outline: `2px solid ${token('color.border.tint.outline')}`,
      outlineOffset: '1px',
    },
    // disabled
    [`${labelClass}[data-disabled="true"] &`]: {
      borderColor: token('color.border.base.@disabled'),
      backgroundColor: token('color.background.input.@disabled'),
    },
    // selected
    '&[data-selected="true"]': {
      borderColor: token('color.border.base.boldest'),
      backgroundColor: token('color.background.input.inverse.default'),
    },
    [`${labelClass}[data-hovered="true"] &[data-selected="true"]`]: {
      backgroundColor: token('color.background.input.inverse.@hover'),
    },
    [`${labelClass}[data-focus-visible="true"] &[data-selected="true"]`]: {
      outline: `2px solid ${token('color.border.tint.outline')}`,
      outlineOffset: '1px',
    },
    // readonly
    [`${labelClass}[data-readonly="true"] &`]: {
      borderColor: token('color.border.base.@disabled'),
    },
    [`${labelClass}[data-readonly="true"] &[data-selected="true"]`]: {
      backgroundColor: token('color.background.input.@disabled'),
    },
    // inverted
    [`${labelClass}[data-inversed="true"] &`]: {
      borderColor: token('color.border.base.inverse.bold'),
      backgroundColor: token('color.background.input.inverse.default'),
    },
    [`${labelClass}[data-inversed="true"] &[data-selected="true"]`]: {
      borderColor: token('color.border.base.inverse.boldest'),
      backgroundColor: token('color.background.input.default'),
    },
    [`${labelClass}[data-hovered="true"][data-inversed="true"] &[data-selected="true"]`]:
      {
        backgroundColor: token('color.background.input.@hover'),
      },
  },
});

export const iconClass = style({
  color: token('color.icon.base.inverse.@active'),
  transition: 'opacity 0.2s ease, transform 0.4s ease',
  transformOrigin: 'center',
  transform: 'scale(0)',
  opacity: 0,
  height: token('size.n3'),
  width: token('size.n3'),
  selectors: {
    // selected
    [`${boxClass}[data-selected="true"] &`]: {
      transform: 'scale(1)',
      opacity: 1,
    },
    // disabled
    [`${labelClass}[data-disabled="true"] ${boxClass}[data-selected="true"] &`]:
      {
        color: token('color.icon.base.@disabled'),
      },
    // readonly
    [`${labelClass}[data-readonly="true"] ${boxClass}[data-selected="true"] &`]:
      {
        color: token('color.icon.base.default'),
      },
    // inverted
    [`${labelClass}[data-inversed="true"] &`]: {
      color: token('color.icon.base.@active'),
    },
  },
});

export const groupClass = recipe({
  base: [
    {
      flexWrap: 'wrap',
      display: 'flex',
    },
  ],
  variants: {
    direction: {
      row: {
        flexDirection: 'row',
        gap: `${token('spacing.n2')} ${token('spacing.n4')}`,
        vars: {
          [maxWidth]: '32%',
        },
      },
      column: {
        flexDirection: 'column',
        gap: token('spacing.n2'),
        vars: {
          [maxWidth]: '100%',
        },
      },
    },
  },
});

export const layoutClass = style({
  display: 'flex',
  flexDirection: 'column',
  gap: token('spacing.n2'),
});
