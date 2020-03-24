import { DefaultFooter } from '@ant-design/pro-layout';
import React from 'react';
import { GithubOutlined } from '@ant-design/icons/lib';

export default function HeFangCmsFooter() {
  return (
    <DefaultFooter
      copyright="hefang.link"
      links={[
        {
          title: '何方博客',
          href: `https://hefang.link?from=${window.location.host}`,
          blankTarget: true,
        },
        {
          title: <GithubOutlined />,
          href: 'https://github.com/iamhefang/hefang-cms-php',
          blankTarget: true,
        },
        {
          title: 'PHP-MVC',
          href: 'https://github.com/iamhefang/php-mvc',
          blankTarget: true,
        },
      ]}
    />
  );
}
