import { z } from 'zod';

export const HouseholdSchema = z.object({
  id: z.string().uuid().optional(),
  sno: z.number().optional(),
  date: z.string(),
  staff_name: z.string(),
  hamlet_code: z.string(),
  household_number: z.string(),
  individual_number: z.string(),
  block: z.string(),
  village_panchayath: z.string(),
  village: z.string(),
  hamlet_name: z.string(),
  door_no: z.string(),
  street: z.string(),
  economic_status: z.enum(['BPL', 'APL', 'Others']),
  religion: z.string(),
  community: z.string(),
  remarks: z.string().optional(),
});

export const MemberSchema = z.object({
  id: z.string().uuid().optional(),
  household_id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  relationship: z.string(),
  age: z.number().min(0).max(150),
  gender: z.enum(['Male', 'Female', 'Other']),
  qualification: z.string().optional(),
  marital_status: z.enum(['Married', 'Unmarried', 'Widow', 'Child']),
  head_of_family: z.boolean(),
  occupation: z.string().optional(),
  category: z.string().optional(),
  mbl_number: z.string().optional(),
  different_aadhaar_linked_mobile: z.string().optional(),
});

// Since the document fields are mostly booleans, we can create a generic boolean schema generator or just list them.
const booleanDocSchema = z.object({
  aadhaar_card: z.boolean().default(false),
  ration_card: z.boolean().default(false),
  e_epic: z.boolean().default(false),
  pan_card: z.boolean().default(false),
  bank_account: z.boolean().default(false),
  income_certificate: z.boolean().default(false),
  community_certificate: z.boolean().default(false),
  birth_certificate: z.boolean().default(false),
  death_certificate: z.boolean().default(false),
  widow_certificate: z.boolean().default(false),
  udid: z.boolean().default(false),
  society_card: z.boolean().default(false),
  fisherman_id_card: z.boolean().default(false),
  fisherman_welfare_card: z.boolean().default(false),
  vb_g_ram_g_act: z.boolean().default(false),
  cmchis: z.boolean().default(false),
  legal_heir: z.boolean().default(false),
});

export const DocumentsSchema = booleanDocSchema.extend({
  id: z.string().uuid().optional(),
  member_id: z.string().uuid().optional(),
});

// Zod Type inference for TypeScript
export type Household = z.infer<typeof HouseholdSchema>;
export type Member = z.infer<typeof MemberSchema>;
export type Documents = z.infer<typeof DocumentsSchema>;
