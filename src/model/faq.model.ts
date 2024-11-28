export class FaqResponse {
  faq_id: string;
  question: string;
  answer: string;
  type: number;
  created_at: Date;
  updated_at: Date;
}

export class FaqRequest {
  faq_id: string;
  question: string;
  answer: string;
  type: number;
}

export class FaqRequestController {
  faq_id: string;
  question: string;
  answer: string;
  type: number;
}

export class FaqEditRequest {
  question: string;
  answer: string;
  type: number;
}
