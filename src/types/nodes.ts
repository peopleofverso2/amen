import { Node } from 'reactflow';

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
    x: number;
    y: number;
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
  videoUrl: string;
  interactionButtons: InteractionButton[];
}

export interface InteractionNodeData extends BaseNodeData {
  action: string;
  parameters: Record<string, unknown>;
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
