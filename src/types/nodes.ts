import { Node, Edge } from 'reactflow';

export type NodeType = 'text' | 'video' | 'interaction' | 'voucher' | 'reward';

export interface InteractionButton {
  id: string;
  label: string;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    fontSize?: string;
  };
  position?: {
    x: number;  // pourcentage de la largeur (0-100)
    y: number;  // pourcentage de la hauteur (0-100)
  };
  alignment?: {
    horizontal: 'left' | 'center' | 'right';
    vertical: 'top' | 'center' | 'bottom';
  };
}

export interface BaseNodeData {
  label: string;
}

export interface TextNodeData extends BaseNodeData {
  content: string;
  interactionButtons: InteractionButton[];
}

export interface VideoNodeData extends BaseNodeData {
  videoUrl?: string;
  interactionButtons: InteractionButton[];
}

export interface InteractionNodeData extends BaseNodeData {
  parentNodeId: string;  // ID du nœud vidéo parent
  buttons: InteractionButton[];
  timing: {
    showAtEnd: boolean;  // Si true, affiche à la fin de la vidéo
    showAtTime?: number; // Sinon, affiche à ce timestamp spécifique
    duration?: number;   // Durée d'affichage en secondes (optionnel)
  };
}

export interface VoucherNodeData extends BaseNodeData {
  qrCodeData: string;
  expirationDate?: Date;
}

export interface RewardNodeData extends BaseNodeData {
  rewardType: string;
  value: number;
}

export type CustomNode = Node<
  TextNodeData | VideoNodeData | InteractionNodeData | VoucherNodeData | RewardNodeData
>;

export type CustomEdge = Edge;
