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
    successRate: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 0;
        max: 100;
      }> &
      Attribute.DefaultTo<50>;
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

export interface ModifiersModifiers extends Schema.Component {
  collectionName: 'components_modifiers_modifiers';
  info: {
    displayName: 'Modifiers';
  };
  attributes: {
    offense: Attribute.Integer & Attribute.Required & Attribute.DefaultTo<0>;
    defense: Attribute.Integer & Attribute.Required & Attribute.DefaultTo<0>;
    buff: Attribute.Integer & Attribute.Required & Attribute.DefaultTo<0>;
  };
}

export interface PositioningConnections extends Schema.Component {
  collectionName: 'components_positioning_connections';
  info: {
    displayName: 'Connection';
    icon: 'code';
    description: '';
  };
  attributes: {
    sourceNodeID: Attribute.String;
    targetNodeID: Attribute.String;
  };
}

export interface PositioningPosition extends Schema.Component {
  collectionName: 'components_positioning_positions';
  info: {
    displayName: 'Position';
    description: '';
  };
  attributes: {
    x: Attribute.Integer;
    y: Attribute.Integer;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'actions.placeholder-action': ActionsPlaceholderAction;
      'effects.add-victory-points': EffectsAddVictoryPoints;
      'effects.buff-debuff': EffectsBuffDebuff;
      'effects.stop-offense-action': EffectsStopOffenseAction;
      'modifiers.modifiers': ModifiersModifiers;
      'positioning.connections': PositioningConnections;
      'positioning.position': PositioningPosition;
    }
  }
}
