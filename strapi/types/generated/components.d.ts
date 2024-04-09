import type { Schema, Attribute } from '@strapi/strapi';

export interface ActionsPlaceholderAction extends Schema.Component {
  collectionName: 'components_actions_placeholder_actions';
  info: {
    displayName: 'placeholder-action';
    icon: 'clock';
    description: '';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    description: Attribute.String;
    duration: Attribute.Float & Attribute.Required;
    teamRole: Attribute.Enumeration<
      ['leader', 'intelligence', 'military', 'media', 'diplomat']
    > &
      Attribute.Required;
    type: Attribute.Enumeration<['offense', 'defense']> & Attribute.Required;
  };
}

export interface EffectsAddVictoryPoints extends Schema.Component {
  collectionName: 'components_effects_add_victory_points';
  info: {
    displayName: 'Add Victory Points';
    description: '';
  };
  attributes: {
    points: Attribute.Integer & Attribute.Required;
    myTeam: Attribute.Boolean & Attribute.Required & Attribute.DefaultTo<true>;
  };
}

export interface EffectsBuffDebuff extends Schema.Component {
  collectionName: 'components_effects_buff_debuffs';
  info: {
    displayName: 'Add Buff/Debuff';
    description: '';
  };
  attributes: {
    teamRole: Attribute.Enumeration<
      ['leader', 'intelligence', 'military', 'diplomat', 'media']
    > &
      Attribute.Required;
    buff: Attribute.Integer & Attribute.Required;
    myTeam: Attribute.Boolean & Attribute.Required & Attribute.DefaultTo<true>;
  };
}

export interface EffectsStopOffenseAction extends Schema.Component {
  collectionName: 'components_effects_stop_offense_actions';
  info: {
    displayName: 'Stop Offense Action';
    description: '';
  };
  attributes: {
    teamRole: Attribute.Enumeration<
      ['leader', 'intelligence', 'military', 'diplomat', 'media']
    > &
      Attribute.Required;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'actions.placeholder-action': ActionsPlaceholderAction;
      'effects.add-victory-points': EffectsAddVictoryPoints;
      'effects.buff-debuff': EffectsBuffDebuff;
      'effects.stop-offense-action': EffectsStopOffenseAction;
    }
  }
}
