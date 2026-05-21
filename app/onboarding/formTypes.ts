export interface FormData {
  // Step 1
  email: string;
  type: 'individual' | 'company' | '';
  country: string;
  sessionId: string;

  // Individual - Step 2
  individualName: string;
  nationalIdNumber: string;
  idProofBase64: string;
  idProofName: string;
  contactNumber: string;
  registeredAddress: string;
  pincode: string;
  mailingAddress: string;
  officialEmail: string;
  designation: string;
  workDescription: string;
  socialMediaHandles: string;

  // Company - Step 2
  companyName: string;
  companyRegNumber: string;
  regCertBase64: string;
  regCertName: string;
  gstin: string;
  companyContact: string;
  companyRegisteredAddress: string;
  companyPincode: string;
  companyMailingAddress: string;
  companyDescription: string;
  signatoryName: string;
  signatoryDesignation: string;
  signatoryEmail: string;
  companySocialMedia: string;
  copyrightCertBase64: string;
  copyrightCertName: string;

  // Company additional
  companyOfficialEmail: string;

  // Step 3
  services: string[];
  serviceDetails: Record<string, string>;

  // Step 6
  paymentPlan: 'standard' | 'pro' | 'business' | 'custom' | '';
  paymentMethod: 'card' | 'bank' | '';
}

export const INITIAL_FORM_DATA: FormData = {
  email: '', type: '', country: '', sessionId: '',
  individualName: '', nationalIdNumber: '', idProofBase64: '', idProofName: '',
  contactNumber: '', registeredAddress: '', pincode: '', mailingAddress: '',
  officialEmail: '', designation: '', workDescription: '', socialMediaHandles: '',
  companyName: '', companyRegNumber: '', regCertBase64: '', regCertName: '',
  gstin: '', companyContact: '', companyRegisteredAddress: '', companyPincode: '',
  companyMailingAddress: '', companyDescription: '',
  signatoryName: '', signatoryDesignation: '', signatoryEmail: '', companySocialMedia: '',
  copyrightCertBase64: '', copyrightCertName: '',
  companyOfficialEmail: '',
  services: [],
  serviceDetails: {},
  paymentPlan: '',
  paymentMethod: '',
};
