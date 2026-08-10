import * as XLSX from 'xlsx';
import type { DraftSurvey } from '../store';

const ROW_0 = ['                                                                                                                                                                          HOUSEHOLD SURVEY'];
const ROW_1 = ["S.NO","DATE","STAFF NAME","HAMLET CODE","HOUSE HOLD  NUMBER","INDIVIDUAL NUMBER","BLOCK","VILLAGE PANCHAYATH","VILLAGE","HAMLET NAME","DOOR NO","STREET","ECONOMIC STATUS","RELIGION","COMMUNITY","NAME  OF THE FAMILY MEMBER","RELATIONSHIP","AGE","GENDER","QUALIFICATION","MARITAL STATUS","HEAD OF THE FAMILY","OCCUPATION","CATEGORY","MBL NUMBER","IF DIFFERENT AADHAAR LINKED MOBILE NUMBER","DOCUMENTS AVAILABLE",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"CORRECTION REQURED",null,null,null,null,null,null,null,null,null,null,"TYPES OF CORRECTION",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"NEW DOCUMENTS NEEDED",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"REMARKS","BASE DOCUMENTS AVAILABLE",null,null,null,null,null,null,null,"ADDITIONAL DOCUMENTS",null,null,"REMARKS","SCHEMES ACCESSED",null,null,null,null,null,null,null,null,null,null,null,null,null,null,"ELIGIBLE SCHEMES",null,null,null,null,null,null,null,null,null,null,null,null,null,null,"IF APPLIED FOLLOWUP NEEDED",null,null,null,null,"DOCUMENTS FURTHER NEEDED",null,null,null,"FOLLOWUP NEEDED","REMARKS","ENTRY BY"];
const ROW_2 = [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"Aadhar Card","Ration card","E-Epic","PAN Card","Bank Account","Income Certificate","Community Certificate","Birth Certificate","Death Certificate","Widow Certificate","UDID","Society Card","Fisherman ID Card","Fisherman Welfare board Card","VB G Ram G Act","CM Comprehensive Health Insurance Scheme (CMCHIS)","Legal heir",null,"Aadhar Card","Ration card","E-Epic","PAN Card","Community Certificate","Birth Certificate","Fisherman ID Card","Fisherman Welfare board Card","CM Comprehensive Health Insurance Scheme (CMCHIS)",null,null,"Aadhar Card",null,null,null,null,null,null,null,null,null,null,"Ration card",null,null,null,null,null,null,null,null,null,null,"E-Epic",null,null,null,null,null,null,null,null,null,null,"PAN Card",null,null,null,null,null,null,"Community Certificate","Birth Certificate","Fisherman ID Card","Fisherman Welfare board Card","CM Comprehensive Health Insurance Scheme (CMCHIS)",null,null,"Aadhar Card","Ration card","E-Epic","PAN Card","Bank Account","Income Certificate","Community Certificate","Birth Certificate","Death Certificate","Widow Certificate","UDID","Society Card","Fisherman ID Card","Fisherman Welfare board Card","VB G Ram G Act","CM Comprehensive Health Insurance Scheme (CMCHIS)","Land Rights",null,null,null,"Aadhar Card","Ration card","E-Epic","PAN Card","Bank Account","Birth Certificate",null,null,null,null,null,null,"Old Age Pension","Widow pension","Disability Pension","CM Girl Child Protection Scheme","Death Relief Assistance Schemes","Women Welfare Schemes","Puthumai Penn Schemes","Tamil Puthalvan Schemes","Widow's Daughter Marriage Assistance Schemes","Fishing Ban Period Relief","Short-term Relief","Saving Period Schemes (Society Card)","VB G Ram G Act","CM Comprehensive Health Insurance Scheme (CMCHIS)","Different Subsidiaries","Old Age Pension","Widow pension","Disability Pension","Maternity Benefit Schemes","Death Relief Assistance Schemes","Women Welfare Schemes","Puthumai Penn Schemes","Tamil Puthalvan Schemes","Widow's Daughter Marriage Assistance Schemes","Fishing Ban Period Relief","Short-term Relief","Saving Period Schemes (Society Card)","Different Subsidiaries"];
const ROW_3 = [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"Name","DOB","Address","Mobile Number","Guardian Name","Photo","Update","Others",null,null,null,"Name","DOB","Address","Mobile Number","Remove/Add Name","Photo","Update","Others",null,null,null,"Name","DOB","Address","Mobile Number","Guardian Name","Photo","Update","Others",null,null,null,"Name","DOB","Address","Guardian Name","Update","Others"];

export function generateCareExcel(surveys: DraftSurvey[], filterType: 'weekly' | 'monthly' | 'all' = 'all') {
  // Filter surveys by date
  const now = new Date();
  const filteredSurveys = surveys.filter(survey => {
    if (filterType === 'all') return true;
    if (!survey.household.date) return false;
    const surveyDate = new Date(survey.household.date);
    const diffTime = Math.abs(now.getTime() - surveyDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (filterType === 'weekly') {
      return diffDays <= 7;
    } else if (filterType === 'monthly') {
      return diffDays <= 30;
    }
    return true;
  });

  const rows: any[][] = [];
  
  // Add headers
  rows.push(ROW_0);
  rows.push(ROW_1);
  rows.push(ROW_2);
  rows.push(ROW_3);

  // Map each member to a row
  let sno = 1;
  for (const survey of filteredSurveys) {
    const hh = survey.household;
    const members = survey.members || [];
    
    for (const member of members) {
      const row = new Array(176).fill('');
      
      // Basic Info
      row[0] = sno++;
      row[1] = hh.date || '';
      row[2] = hh.staff_name || '';
      row[3] = hh.hamlet_code || '';
      row[4] = hh.household_number || '';
      row[5] = hh.individual_number || '';
      row[6] = hh.block || '';
      row[7] = hh.village_panchayath || '';
      row[8] = hh.village || '';
      row[9] = hh.hamlet_name || '';
      row[10] = hh.door_no || '';
      row[11] = hh.street || '';
      row[12] = hh.economic_status || '';
      row[13] = hh.religion || '';
      row[14] = hh.community || '';
      row[15] = member.name || '';
      row[16] = member.relationship || '';
      row[17] = member.age ?? '';
      row[18] = member.gender || '';
      row[19] = member.qualification || '';
      row[20] = member.marital_status || '';
      row[21] = member.head_of_family ? 'Yes' : 'No';
      row[22] = member.occupation || '';
      row[23] = member.category || '';
      row[24] = member.mbl_number || '';
      row[25] = member.different_aadhaar_linked_mobile || '';

      // Documents Available (26 to 42)
      const docs = survey.documents?.[member.id!] || {};
      row[26] = docs.aadhaar_card ? 'Yes' : 'No';
      row[27] = docs.ration_card ? 'Yes' : 'No';
      row[28] = docs.e_epic ? 'Yes' : 'No';
      row[29] = docs.pan_card ? 'Yes' : 'No';
      row[30] = docs.bank_account ? 'Yes' : 'No';
      row[31] = docs.income_certificate ? 'Yes' : 'No';
      row[32] = docs.community_certificate ? 'Yes' : 'No';
      row[33] = docs.birth_certificate ? 'Yes' : 'No';
      row[34] = docs.death_certificate ? 'Yes' : 'No';
      row[35] = docs.widow_certificate ? 'Yes' : 'No';
      row[36] = docs.udid ? 'Yes' : 'No';
      row[37] = docs.society_card ? 'Yes' : 'No';
      row[38] = docs.fisherman_id_card ? 'Yes' : 'No';
      row[39] = docs.fisherman_welfare_card ? 'Yes' : 'No';
      row[40] = docs.vb_g_ram_g_act ? 'Yes' : 'No';
      row[41] = docs.cmchis ? 'Yes' : 'No';
      row[42] = docs.legal_heir ? 'Yes' : 'No';

      // Correction Required (44 to 52)
      const corrections = survey.corrections?.[member.id!] || {};
      row[44] = Object.values(corrections['aadhaar_card'] || {}).some(v => v) ? 'Yes' : 'No';
      row[45] = Object.values(corrections['ration_card'] || {}).some(v => v) ? 'Yes' : 'No';
      row[46] = Object.values(corrections['e_epic'] || {}).some(v => v) ? 'Yes' : 'No';
      row[47] = Object.values(corrections['pan_card'] || {}).some(v => v) ? 'Yes' : 'No';
      row[48] = Object.values(corrections['community_certificate'] || {}).some(v => v) ? 'Yes' : 'No';
      row[49] = Object.values(corrections['birth_certificate'] || {}).some(v => v) ? 'Yes' : 'No';
      row[50] = Object.values(corrections['fisherman_id_card'] || {}).some(v => v) ? 'Yes' : 'No';
      row[51] = Object.values(corrections['fisherman_welfare_card'] || {}).some(v => v) ? 'Yes' : 'No';
      row[52] = Object.values(corrections['cmchis'] || {}).some(v => v) ? 'Yes' : 'No';

      // Types of Correction (55 to 101)
      const aadhaarCorr = corrections['aadhaar_card'] || {};
      row[55] = aadhaarCorr['Name'] ? 'Yes' : 'No';
      row[56] = aadhaarCorr['DOB'] ? 'Yes' : 'No';
      row[57] = aadhaarCorr['Address'] ? 'Yes' : 'No';
      row[58] = aadhaarCorr['Mobile_Number'] ? 'Yes' : 'No';
      row[59] = aadhaarCorr['Guardian_Name'] ? 'Yes' : 'No';
      row[60] = aadhaarCorr['Photo'] ? 'Yes' : 'No';
      row[61] = aadhaarCorr['Update'] ? 'Yes' : 'No';
      row[62] = aadhaarCorr['Others'] ? 'Yes' : 'No';

      const rationCorr = corrections['ration_card'] || {};
      row[66] = rationCorr['Name'] ? 'Yes' : 'No';
      row[67] = rationCorr['DOB'] ? 'Yes' : 'No';
      row[68] = rationCorr['Address'] ? 'Yes' : 'No';
      row[69] = rationCorr['Mobile_Number'] ? 'Yes' : 'No';
      row[70] = rationCorr['Remove/Add Name'] ? 'Yes' : 'No';
      row[71] = rationCorr['Photo'] ? 'Yes' : 'No';
      row[72] = rationCorr['Update'] ? 'Yes' : 'No';
      row[73] = rationCorr['Others'] ? 'Yes' : 'No';

      const eepicCorr = corrections['e_epic'] || {};
      row[77] = eepicCorr['Name'] ? 'Yes' : 'No';
      row[78] = eepicCorr['DOB'] ? 'Yes' : 'No';
      row[79] = eepicCorr['Address'] ? 'Yes' : 'No';
      row[80] = eepicCorr['Mobile_Number'] ? 'Yes' : 'No';
      row[81] = eepicCorr['Guardian_Name'] ? 'Yes' : 'No';
      row[82] = eepicCorr['Photo'] ? 'Yes' : 'No';
      row[83] = eepicCorr['Update'] ? 'Yes' : 'No';
      row[84] = eepicCorr['Others'] ? 'Yes' : 'No';

      const panCorr = corrections['pan_card'] || {};
      row[88] = panCorr['Name'] ? 'Yes' : 'No';
      row[89] = panCorr['DOB'] ? 'Yes' : 'No';
      row[90] = panCorr['Address'] ? 'Yes' : 'No';
      row[91] = panCorr['Guardian_Name'] ? 'Yes' : 'No';
      row[92] = panCorr['Update'] ? 'Yes' : 'No';
      row[93] = panCorr['Others'] ? 'Yes' : 'No';

      row[95] = Object.values(corrections['community_certificate'] || {}).some(v => v) ? 'Yes' : 'No';
      row[96] = Object.values(corrections['birth_certificate'] || {}).some(v => v) ? 'Yes' : 'No';
      row[97] = Object.values(corrections['fisherman_id_card'] || {}).some(v => v) ? 'Yes' : 'No';
      row[98] = Object.values(corrections['fisherman_welfare_card'] || {}).some(v => v) ? 'Yes' : 'No';
      row[99] = Object.values(corrections['cmchis'] || {}).some(v => v) ? 'Yes' : 'No';

      // New Documents Needed (102 to 119)
      const newDocs = survey.new_docs?.[member.id!] || {};
      row[102] = newDocs['aadhaar_card'] ? 'Yes' : 'No';
      row[103] = newDocs['ration_card'] ? 'Yes' : 'No';
      row[104] = newDocs['e_epic'] ? 'Yes' : 'No';
      row[105] = newDocs['pan_card'] ? 'Yes' : 'No';
      row[106] = newDocs['bank_account'] ? 'Yes' : 'No';
      row[107] = newDocs['income_certificate'] ? 'Yes' : 'No';
      row[108] = newDocs['community_certificate'] ? 'Yes' : 'No';
      row[109] = newDocs['birth_certificate'] ? 'Yes' : 'No';
      row[110] = newDocs['death_certificate'] ? 'Yes' : 'No';
      row[111] = newDocs['widow_certificate'] ? 'Yes' : 'No';
      row[112] = newDocs['udid'] ? 'Yes' : 'No';
      row[113] = newDocs['society_card'] ? 'Yes' : 'No';
      row[114] = newDocs['fisherman_id_card'] ? 'Yes' : 'No';
      row[115] = newDocs['fisherman_welfare_card'] ? 'Yes' : 'No';
      row[116] = newDocs['vb_g_ram_g_act'] ? 'Yes' : 'No';
      row[117] = newDocs['cmchis'] ? 'Yes' : 'No';
      row[118] = newDocs['land_rights'] ? 'Yes' : 'No'; 
      
      row[121] = ''; // REMARKS

      // Base Documents Available (122 to 127)
      const baseDocs = survey.base_docs?.[member.id!] || {};
      row[122] = baseDocs['aadhaar_card'] ? 'Yes' : 'No';
      row[123] = baseDocs['ration_card'] ? 'Yes' : 'No';
      row[124] = baseDocs['e_epic'] ? 'Yes' : 'No';
      row[125] = baseDocs['pan_card'] ? 'Yes' : 'No';
      row[126] = baseDocs['bank_account'] ? 'Yes' : 'No';
      row[127] = baseDocs['birth_certificate'] ? 'Yes' : 'No';

      row[133] = ''; // REMARKS
      
      const schemes = survey.schemes?.[member.id!] || {};
      
      const schemeKeys = [
        'old_age_pension',
        'widow_pension',
        'disability_pension',
        'cm_girl_child_protection_scheme',
        'death_relief_assistance',
        'women_welfare_schemes',
        'puthumai_penn_schemes',
        'tamil_puthalvan_schemes',
        'widows_daughter_marriage_assistance',
        'fishing_ban_period_relief',
        'short_term_relief',
        'saving_period_schemes',
        'vb_g_ram_g_act',
        'cmchis',
        'different_subsidiaries'
      ];
      
      for (let i = 0; i < schemeKeys.length; i++) {
        const schemeObj = (schemes as any)[schemeKeys[i]] || {};
        row[134 + i] = schemeObj.accessed ? 'Yes' : 'No';
      }

      const eligibleSchemeKeys = [
        'old_age_pension',
        'widow_pension',
        'disability_pension',
        'maternity_benefit_schemes',
        'death_relief_assistance',
        'women_welfare_schemes',
        'puthumai_penn_schemes',
        'tamil_puthalvan_schemes',
        'widows_daughter_marriage_assistance',
        'fishing_ban_period_relief',
        'short_term_relief',
        'saving_period_schemes',
        'different_subsidiaries'
      ];

      for (let i = 0; i < eligibleSchemeKeys.length; i++) {
        const schemeObj = (schemes as any)[eligibleSchemeKeys[i]] || {};
        row[149 + i] = schemeObj.eligible ? 'Yes' : 'No';
      }

      row[175] = hh.staff_name || '';

      rows.push(row);
    }
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 175 } },
    { s: { r: 1, c: 26 }, e: { r: 1, c: 42 } },
    { s: { r: 1, c: 44 }, e: { r: 1, c: 52 } },
    { s: { r: 1, c: 55 }, e: { r: 1, c: 101 } },
    { s: { r: 1, c: 102 }, e: { r: 1, c: 118 } },
    { s: { r: 1, c: 122 }, e: { r: 1, c: 127 } },
    { s: { r: 1, c: 130 }, e: { r: 1, c: 132 } },
    { s: { r: 1, c: 134 }, e: { r: 1, c: 148 } },
    { s: { r: 1, c: 149 }, e: { r: 1, c: 162 } },
    { s: { r: 1, c: 164 }, e: { r: 1, c: 168 } },
    { s: { r: 1, c: 169 }, e: { r: 1, c: 172 } },
  ];
  ws['!merges'] = merges;

  XLSX.utils.book_append_sheet(wb, ws, 'Survey Data');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  XLSX.writeFile(wb, `Household_Survey_${filterType}_${timestamp}.xlsx`);
}
