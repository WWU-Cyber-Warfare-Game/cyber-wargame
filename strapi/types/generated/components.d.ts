import type { Schema, Attribute } from '@strapi/strapi';

export interface ActionsPlaceholderAction extends Schema.Component {
  collectionName: 'components_actions_placeholder_actions';
  info: {
    displayName: 'placeholder-action';
    icon: 'clock';
    description: '';
  };
  attributes: {
    name: Attribute.String;
    description: Attribute.String;
    duration: Attribute.Integer;
    teamRole: Attribute.Enumeration<
      ['leader', 'intelligence', 'military', 'media', 'diplomat']
    >;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'actions.placeholder-action': ActionsPlaceholderAction;
    }
  }
}
