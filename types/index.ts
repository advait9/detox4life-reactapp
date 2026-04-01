// ─── Risk & Category Enums ───────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high';
export type OverallRisk = 'low' | 'medium' | 'high';
export type StoredRiskLevel = 'safe' | 'low' | 'moderate' | 'high' | 'critical';

export type ProductCategory =
  | 'Food'
  | 'Utensils'
  | 'Furniture'
  | 'Electronics'
  | 'Cosmetics'
  | 'Hygiene'
  | 'Others';

export type RoomType =
  | 'Bathroom'
  | 'Bedroom'
  | 'Living'
  | 'Study'
  | 'Kitchen'
  | 'Car'
  | 'Office'
  | 'Garden'
  | 'Others';

export type ItemCategory =
  | 'Product'
  | 'Furniture'
  | 'Utensil'
  | 'Electronics'
  | 'Appliance'
  | 'Textile'
  | 'Plant'
  | 'Others';

// ─── Product Analysis ─────────────────────────────────────────────────────────

export interface Ingredient {
  name: string;
  healthRisk: RiskLevel;
  reasoning: string;
  citation: string;
}

export interface UnstatedIngredient extends Ingredient {
  reason: string;
}

export interface ProductAnalysisResponse {
  ProductName: string;
  ProductCategory: ProductCategory;
  TypicalLocation: RoomType;
  StatedIngredients: Ingredient[];
  UnstatedIngredients: UnstatedIngredient[];
}

// ─── Room Analysis ────────────────────────────────────────────────────────────

export interface RoomChemical {
  name: string;
  source: 'label' | 'predicted';
  healthRisk: RiskLevel;
  reasoning: string;
  citation: string;
}

export interface RoomItem {
  itemName: string;
  brand: string | null;
  productName: string | null;
  itemCategory: ItemCategory;
  overallRisk: OverallRisk;
  chemicals: RoomChemical[];
}

export interface RoomAnalysisResponse {
  roomType: RoomType;
  items: RoomItem[];
  roomOverallRisk: OverallRisk;
}

// ─── Scan (stored locally) ────────────────────────────────────────────────────

export type ScanType = 'product' | 'room';

export interface StoredScan {
  id: string;
  type: ScanType;
  name: string;
  image_uri: string;
  overall_score: number;
  risk_level: StoredRiskLevel;
  response_json: string;
  analyzed_at: string;
  created_at: string;
}

// ─── Scan State Machine ───────────────────────────────────────────────────────

export type ScanPhase =
  | 'idle'
  | 'capturing'
  | 'uploading'
  | 'analyzing'
  | 'complete'
  | 'error';

// ─── Camera ───────────────────────────────────────────────────────────────────

export type FlashMode = 'auto' | 'on' | 'off';
export type CameraFacing = 'front' | 'back';
export type ScanMode = 'product' | 'room';

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  message: string;
}
