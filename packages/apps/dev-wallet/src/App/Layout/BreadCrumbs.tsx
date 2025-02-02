import { MonoWindow } from '@kadena/kode-icons/system';
import {
  BreadcrumbsItem,
  Breadcrumbs as BreadcrumbsUI,
  Text,
} from '@kadena/kode-ui';
import { useLayout } from '@kadena/kode-ui/patterns';
import { FC } from 'react';
import { Link } from 'react-router-dom';

export const BreadCrumbs: FC = () => {
  const { breadCrumbs } = useLayout();

  return (
    <BreadcrumbsUI
      icon={
        <Text>
          {breadCrumbs.length ? breadCrumbs[0].visual : <MonoWindow />}
        </Text>
      }
    >
      <>
        <BreadcrumbsItem component={Link} href="/">
          Dashboard
        </BreadcrumbsItem>
        {breadCrumbs.map((crumb) => (
          <BreadcrumbsItem key={crumb.url} component={Link} href={crumb.url}>
            {crumb.label}
          </BreadcrumbsItem>
        ))}
      </>
    </BreadcrumbsUI>
  );
};
