// Interface automatically generated by schemas-to-ts

import { PlaceholderAction } from '../../../../components/actions/interfaces/PlaceholderAction';
import { PlaceholderAction_Plain } from '../../../../components/actions/interfaces/PlaceholderAction';
import { PlaceholderAction_NoRelations } from '../../../../components/actions/interfaces/PlaceholderAction';

export interface PendingAction {
  id: number;
  attributes: {
    createdAt: Date;    updatedAt: Date;    publishedAt?: Date;    User?: string;
    Date?: Date;
    Action: PlaceholderAction[];
  };
}
export interface PendingAction_Plain {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  User?: string;
  Date?: Date;
  Action: PlaceholderAction_Plain[];
}

export interface PendingAction_NoRelations {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  User?: string;
  Date?: Date;
  Action: PlaceholderAction_NoRelations[];
}

export interface PendingAction_AdminPanelLifeCycle {
  id: number;
  createdAt: Date;  updatedAt: Date;  publishedAt?: Date;  User?: string;
  Date?: Date;
  Action: PlaceholderAction_Plain[];
}
