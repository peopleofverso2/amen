import { Node, Edge } from 'reactflow';

export type NodeType = 'text' | 'video' | 'interaction' | 'voucher' | 'reward';

export interface Choice {
  text: string;
  nextNodeId: string;
  condition?: string;
}

export interface BaseNodeData {
  label: string;
  choices: Choice[];
}

export interface TextNodeData extends BaseNodeData {
  content: string;
}

export interface VideoNodeData extends BaseNodeData {
  videoUrl: string;
  customButtons: {
    label: string;
    timestamp: number;
  }[];
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
