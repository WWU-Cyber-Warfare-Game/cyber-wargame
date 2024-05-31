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
    description: Attribute.Text;
    duration: Attribute.Float & Attribute.Required;
    teamRole: Attribute.Enumeration<
      ['leader', 'intelligence', 'military', 'media', 'diplomat']
    > &
      Attribute.Required;
    type: Attribute.Enumeration<['offense', 'defense']> & Attribute.Required;
    successRate: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
          max: 100;
        },
        number
      > &
      Attribute.DefaultTo<50>;
    targets: Attribute.Component<'actions.targets'>;
    cost: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
  };
}

export interface ActionsTargets extends Schema.Component {
  collectionName: 'components_actions_targets';
  info: {
    displayName: 'targets';
    description: '';
  };
  attributes: {
    target: Attribute.Enumeration<['node', 'edge', 'player']> &
      Attribute.Required;
    myTeam: Attribute.Boolean & Attribute.Required;
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

export interface EffectsAttackEdge extends Schema.Component {
  collectionName: 'components_effects_attack_edges';
  info: {
    displayName: 'Attack Edge';
    description: '';
  };
  attributes: {};
}

export interface EffectsAttackNode extends Schema.Component {
  collectionName: 'components_modifiers_attack_nodes';
  info: {
    displayName: 'Attack Node';
    description: '';
  };
  attributes: {};
}

export interface EffectsBuffDebuffTargeted extends Schema.Component {
  collectionName: 'components_effects_buff_debuff_targeteds';
  info: {
    displayName: 'Add Buff/Debuff (Targeted)';
    description: '';
  };
  attributes: {
    buff: Attribute.Integer & Attribute.Required;
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

export interface EffectsDefendEdge extends Schema.Component {
  collectionName: 'components_effects_defend_edges';
  info: {
    displayName: 'Defend Edge';
    description: '';
  };
  attributes: {};
}

export interface EffectsDefendNode extends Schema.Component {
  collectionName: 'components_effects_defend_nodes';
  info: {
    displayName: 'Defend Node';
    description: '';
  };
  attributes: {};
}

export interface EffectsDistributeFunds extends Schema.Component {
  collectionName: 'components_effects_distribute_funds';
  info: {
    displayName: 'Distribute Funds';
    description: '';
  };
  attributes: {
    amount: Attribute.Integer & Attribute.Required;
  };
}

export interface EffectsRevealNode extends Schema.Component {
  collectionName: 'components_effects_reveal_nodes';
  info: {
    displayName: 'Reveal Node';
    description: '';
  };
  attributes: {};
}

export interface EffectsSecureNode extends Schema.Component {
  collectionName: 'components_effects_secure_nodes';
  info: {
    displayName: 'Secure Node';
    description: '';
  };
  attributes: {};
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
      'actions.targets': ActionsTargets;
      'effects.add-victory-points': EffectsAddVictoryPoints;
      'effects.attack-edge': EffectsAttackEdge;
      'effects.attack-node': EffectsAttackNode;
      'effects.buff-debuff-targeted': EffectsBuffDebuffTargeted;
      'effects.buff-debuff': EffectsBuffDebuff;
      'effects.defend-edge': EffectsDefendEdge;
      'effects.defend-node': EffectsDefendNode;
      'effects.distribute-funds': EffectsDistributeFunds;
      'effects.reveal-node': EffectsRevealNode;
      'effects.secure-node': EffectsSecureNode;
      'effects.stop-offense-action': EffectsStopOffenseAction;
      'modifiers.modifiers': ModifiersModifiers;
      'positioning.connections': PositioningConnections;
      'positioning.position': PositioningPosition;
    }
  }
}
