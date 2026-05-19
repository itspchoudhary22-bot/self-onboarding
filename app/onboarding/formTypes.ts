export interface FormData {
  // Step 1
  email: string;
  type: 'individual' | 'company' | '';
  country: string;
  // Individual Step 2
  individualName: string;
  nationalIdNumber: string;
  contactNumber: string;
  officialEmail: string;
  designation: string;
  // Company Step 2
  companyName: string;
  companyRegNumber: string;
  gstin: string;
  companyContact: string;
  companyDescription: string;
  // Step 3 Address (shared)
  registeredAddress: string;
  pincode: string;
  mailingAddress: string;
  // Individual Step 4
  workDescription: string;
  socialMediaHandles: string;
  // Company Step 4
  signatoryName: string;
  signatoryDesignation: string;
  signatoryEmail: string;
  companySocialMedia: string;
  // Step 5
  services: string[];
}

export const INITIAL_FORM_DATA: FormData = {
  email: '', type: '', country: '',
  individualName: '', nationalIdNumber: '', contactNumber: '', officialEmail: '', designation: '',
  companyName: '', companyRegNumber: '', gstin: '', companyContact: '', companyDescription: '',
  registeredAddress: '', pincode: '', mailingAddress: '',
  workDescription: '', socialMediaHandles: '',
  signatoryName: '', signatoryDesignation: '', signatoryEmail: '', companySocialMedia: '',
  services: [],
};
