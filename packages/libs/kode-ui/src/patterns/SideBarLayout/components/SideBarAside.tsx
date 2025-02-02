import { MonoClose } from '@kadena/kode-icons/system';
import type { FC } from 'react';
import React, { useEffect, useRef } from 'react';
import {
  asideContentClass,
  asideHeaderClass,
  asideHeaderCloseButtonWrapperClass,
  asideHeadingClass,
  asideWrapperClass,
  menuBackdropClass,
} from '../aside.css';
import type { ISideBarLayoutLocation } from '../types';
import type { PressEvent } from './../../../components';
import { Button, Heading, Stack } from './../../../components';
import { useLayout } from './LayoutProvider';

export const SideBarAside: FC<{
  hasTopBanner?: boolean;
  location: ISideBarLayoutLocation;
}> = ({ hasTopBanner, location }) => {
  const {
    setIsRightAsideExpanded,
    isRightAsideExpanded,
    rightAsideTitle,
    setRightAsideRef,
  } = useLayout();
  const ref = useRef<HTMLDivElement | null>();

  const handleExpand = (e: PressEvent) => {
    setIsRightAsideExpanded(false);
  };

  useEffect(() => {
    if (!ref.current) return;
    setRightAsideRef(ref.current);
  }, [ref.current]);

  useEffect(() => {
    setIsRightAsideExpanded(!!location?.hash);
  }, [location?.hash]);

  return (
    <>
      <Stack
        aria-label="background"
        className={menuBackdropClass({
          expanded: isRightAsideExpanded,
        })}
        onClick={handleExpand}
      />
      <aside
        className={asideWrapperClass({
          expanded: isRightAsideExpanded,
          hasTopBanner,
        })}
      >
        <header className={asideHeaderClass}>
          <Stack
            width="100%"
            justifyContent="space-between"
            alignItems="center"
          >
            <Heading variant="h6" as="h3" className={asideHeadingClass}>
              {rightAsideTitle}
            </Heading>

            <Stack className={asideHeaderCloseButtonWrapperClass}>
              <Button
                aria-label="close"
                onPress={handleExpand}
                variant="transparent"
                startVisual={<MonoClose />}
              />
            </Stack>
          </Stack>
        </header>

        <Stack ref={ref} className={asideContentClass} flexDirection="column" />
      </aside>
    </>
  );
};
