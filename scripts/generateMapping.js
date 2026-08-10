const fs = require('fs');
const headers = JSON.parse(fs.readFileSync('scratch/excel_headers.json', 'utf8'));
const row3 = [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"Name","DOB","Address","Mobile Number","Guardian Name","Photo","Update","Others",null,null,null,"Name","DOB","Address","Mobile Number","Remove/Add Name","Photo","Update","Others",null,null,null,"Name","DOB","Address","Mobile Number","Guardian Name","Photo","Update","Others",null,null,null,"Name","DOB","Address","Guardian Name","Update","Others"];

const code = `import * as XLSX from 'xlsx';
import type { DraftSurvey } from '../store';

const ROW_0 = ['                                                                                                                                                                          HOUSEHOLD SURVEY'];
const ROW_1 = ${JSON.stringify(headers.row1)};
const ROW_2 = ${JSON.stringify(headers.row2)};
const ROW_3 = ${JSON.stringify(row3)};

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
  {
    "s": {
      "c": 175,
      "r": 1
    },
    "e": {
      "c": 175,
      "r": 2
    }
  },
  {
    "s": {
      "c": 174,
      "r": 1
    },
    "e": {
      "c": 174,
      "r": 2
    }
  },
  {
    "s": {
      "c": 153,
      "r": 2
    },
    "e": {
      "c": 153,
      "r": 3
    }
  },
  {
    "s": {
      "c": 154,
      "r": 2
    },
    "e": {
      "c": 154,
      "r": 3
    }
  },
  {
    "s": {
      "c": 155,
      "r": 2
    },
    "e": {
      "c": 155,
      "r": 3
    }
  },
  {
    "s": {
      "c": 156,
      "r": 2
    },
    "e": {
      "c": 156,
      "r": 3
    }
  },
  {
    "s": {
      "c": 157,
      "r": 2
    },
    "e": {
      "c": 157,
      "r": 3
    }
  },
  {
    "s": {
      "c": 158,
      "r": 2
    },
    "e": {
      "c": 158,
      "r": 3
    }
  },
  {
    "s": {
      "c": 159,
      "r": 2
    },
    "e": {
      "c": 159,
      "r": 3
    }
  },
  {
    "s": {
      "c": 160,
      "r": 2
    },
    "e": {
      "c": 160,
      "r": 3
    }
  },
  {
    "s": {
      "c": 161,
      "r": 2
    },
    "e": {
      "c": 161,
      "r": 3
    }
  },
  {
    "s": {
      "c": 162,
      "r": 2
    },
    "e": {
      "c": 162,
      "r": 3
    }
  },
  {
    "s": {
      "c": 163,
      "r": 2
    },
    "e": {
      "c": 163,
      "r": 3
    }
  },
  {
    "s": {
      "c": 173,
      "r": 1
    },
    "e": {
      "c": 173,
      "r": 2
    }
  },
  {
    "s": {
      "c": 136,
      "r": 2
    },
    "e": {
      "c": 136,
      "r": 3
    }
  },
  {
    "s": {
      "c": 137,
      "r": 2
    },
    "e": {
      "c": 137,
      "r": 3
    }
  },
  {
    "s": {
      "c": 138,
      "r": 2
    },
    "e": {
      "c": 138,
      "r": 3
    }
  },
  {
    "s": {
      "c": 139,
      "r": 2
    },
    "e": {
      "c": 139,
      "r": 3
    }
  },
  {
    "s": {
      "c": 140,
      "r": 2
    },
    "e": {
      "c": 140,
      "r": 3
    }
  },
  {
    "s": {
      "c": 141,
      "r": 2
    },
    "e": {
      "c": 141,
      "r": 3
    }
  },
  {
    "s": {
      "c": 142,
      "r": 2
    },
    "e": {
      "c": 142,
      "r": 3
    }
  },
  {
    "s": {
      "c": 143,
      "r": 2
    },
    "e": {
      "c": 143,
      "r": 3
    }
  },
  {
    "s": {
      "c": 144,
      "r": 2
    },
    "e": {
      "c": 144,
      "r": 3
    }
  },
  {
    "s": {
      "c": 145,
      "r": 2
    },
    "e": {
      "c": 145,
      "r": 3
    }
  },
  {
    "s": {
      "c": 146,
      "r": 2
    },
    "e": {
      "c": 146,
      "r": 3
    }
  },
  {
    "s": {
      "c": 147,
      "r": 2
    },
    "e": {
      "c": 147,
      "r": 3
    }
  },
  {
    "s": {
      "c": 148,
      "r": 2
    },
    "e": {
      "c": 148,
      "r": 3
    }
  },
  {
    "s": {
      "c": 149,
      "r": 2
    },
    "e": {
      "c": 149,
      "r": 3
    }
  },
  {
    "s": {
      "c": 150,
      "r": 2
    },
    "e": {
      "c": 150,
      "r": 3
    }
  },
  {
    "s": {
      "c": 151,
      "r": 2
    },
    "e": {
      "c": 151,
      "r": 3
    }
  },
  {
    "s": {
      "c": 152,
      "r": 2
    },
    "e": {
      "c": 152,
      "r": 3
    }
  },
  {
    "s": {
      "c": 13,
      "r": 1
    },
    "e": {
      "c": 13,
      "r": 3
    }
  },
  {
    "s": {
      "c": 14,
      "r": 1
    },
    "e": {
      "c": 14,
      "r": 3
    }
  },
  {
    "s": {
      "c": 15,
      "r": 1
    },
    "e": {
      "c": 15,
      "r": 3
    }
  },
  {
    "s": {
      "c": 16,
      "r": 1
    },
    "e": {
      "c": 16,
      "r": 3
    }
  },
  {
    "s": {
      "c": 17,
      "r": 1
    },
    "e": {
      "c": 17,
      "r": 3
    }
  },
  {
    "s": {
      "c": 18,
      "r": 1
    },
    "e": {
      "c": 18,
      "r": 3
    }
  },
  {
    "s": {
      "c": 19,
      "r": 1
    },
    "e": {
      "c": 19,
      "r": 3
    }
  },
  {
    "s": {
      "c": 20,
      "r": 1
    },
    "e": {
      "c": 20,
      "r": 3
    }
  },
  {
    "s": {
      "c": 21,
      "r": 1
    },
    "e": {
      "c": 21,
      "r": 3
    }
  },
  {
    "s": {
      "c": 22,
      "r": 1
    },
    "e": {
      "c": 22,
      "r": 3
    }
  },
  {
    "s": {
      "c": 23,
      "r": 1
    },
    "e": {
      "c": 23,
      "r": 3
    }
  },
  {
    "s": {
      "c": 24,
      "r": 1
    },
    "e": {
      "c": 24,
      "r": 3
    }
  },
  {
    "s": {
      "c": 25,
      "r": 1
    },
    "e": {
      "c": 25,
      "r": 3
    }
  },
  {
    "s": {
      "c": 27,
      "r": 2
    },
    "e": {
      "c": 27,
      "r": 3
    }
  },
  {
    "s": {
      "c": 28,
      "r": 2
    },
    "e": {
      "c": 28,
      "r": 3
    }
  },
  {
    "s": {
      "c": 29,
      "r": 2
    },
    "e": {
      "c": 29,
      "r": 3
    }
  },
  {
    "s": {
      "c": 30,
      "r": 2
    },
    "e": {
      "c": 30,
      "r": 3
    }
  },
  {
    "s": {
      "c": 5,
      "r": 1
    },
    "e": {
      "c": 5,
      "r": 3
    }
  },
  {
    "s": {
      "c": 6,
      "r": 1
    },
    "e": {
      "c": 6,
      "r": 3
    }
  },
  {
    "s": {
      "c": 7,
      "r": 1
    },
    "e": {
      "c": 7,
      "r": 3
    }
  },
  {
    "s": {
      "c": 8,
      "r": 1
    },
    "e": {
      "c": 8,
      "r": 3
    }
  },
  {
    "s": {
      "c": 9,
      "r": 1
    },
    "e": {
      "c": 9,
      "r": 3
    }
  },
  {
    "s": {
      "c": 10,
      "r": 1
    },
    "e": {
      "c": 10,
      "r": 3
    }
  },
  {
    "s": {
      "c": 11,
      "r": 1
    },
    "e": {
      "c": 11,
      "r": 3
    }
  },
  {
    "s": {
      "c": 12,
      "r": 1
    },
    "e": {
      "c": 12,
      "r": 3
    }
  },
  {
    "s": {
      "c": 0,
      "r": 1
    },
    "e": {
      "c": 0,
      "r": 3
    }
  },
  {
    "s": {
      "c": 1,
      "r": 1
    },
    "e": {
      "c": 1,
      "r": 3
    }
  },
  {
    "s": {
      "c": 2,
      "r": 1
    },
    "e": {
      "c": 2,
      "r": 3
    }
  },
  {
    "s": {
      "c": 3,
      "r": 1
    },
    "e": {
      "c": 3,
      "r": 3
    }
  },
  {
    "s": {
      "c": 4,
      "r": 1
    },
    "e": {
      "c": 4,
      "r": 3
    }
  },
  {
    "s": {
      "c": 66,
      "r": 0
    },
    "e": {
      "c": 68,
      "r": 0
    }
  },
  {
    "s": {
      "c": 88,
      "r": 0
    },
    "e": {
      "c": 89,
      "r": 0
    }
  },
  {
    "s": {
      "c": 26,
      "r": 1
    },
    "e": {
      "c": 43,
      "r": 1
    }
  },
  {
    "s": {
      "c": 44,
      "r": 1
    },
    "e": {
      "c": 54,
      "r": 1
    }
  },
  {
    "s": {
      "c": 55,
      "r": 1
    },
    "e": {
      "c": 101,
      "r": 1
    }
  },
  {
    "s": {
      "c": 102,
      "r": 1
    },
    "e": {
      "c": 120,
      "r": 1
    }
  },
  {
    "s": {
      "c": 122,
      "r": 1
    },
    "e": {
      "c": 127,
      "r": 1
    }
  },
  {
    "s": {
      "c": 130,
      "r": 1
    },
    "e": {
      "c": 132,
      "r": 1
    }
  },
  {
    "s": {
      "c": 134,
      "r": 1
    },
    "e": {
      "c": 148,
      "r": 1
    }
  },
  {
    "s": {
      "c": 149,
      "r": 1
    },
    "e": {
      "c": 163,
      "r": 1
    }
  },
  {
    "s": {
      "c": 164,
      "r": 1
    },
    "e": {
      "c": 168,
      "r": 1
    }
  },
  {
    "s": {
      "c": 169,
      "r": 1
    },
    "e": {
      "c": 172,
      "r": 1
    }
  },
  {
    "s": {
      "c": 55,
      "r": 2
    },
    "e": {
      "c": 65,
      "r": 2
    }
  },
  {
    "s": {
      "c": 66,
      "r": 2
    },
    "e": {
      "c": 76,
      "r": 2
    }
  },
  {
    "s": {
      "c": 77,
      "r": 2
    },
    "e": {
      "c": 87,
      "r": 2
    }
  },
  {
    "s": {
      "c": 88,
      "r": 2
    },
    "e": {
      "c": 94,
      "r": 2
    }
  },
  {
    "s": {
      "c": 31,
      "r": 2
    },
    "e": {
      "c": 31,
      "r": 3
    }
  },
  {
    "s": {
      "c": 32,
      "r": 2
    },
    "e": {
      "c": 32,
      "r": 3
    }
  },
  {
    "s": {
      "c": 33,
      "r": 2
    },
    "e": {
      "c": 33,
      "r": 3
    }
  },
  {
    "s": {
      "c": 34,
      "r": 2
    },
    "e": {
      "c": 34,
      "r": 3
    }
  },
  {
    "s": {
      "c": 45,
      "r": 2
    },
    "e": {
      "c": 45,
      "r": 3
    }
  },
  {
    "s": {
      "c": 46,
      "r": 2
    },
    "e": {
      "c": 46,
      "r": 3
    }
  },
  {
    "s": {
      "c": 47,
      "r": 2
    },
    "e": {
      "c": 47,
      "r": 3
    }
  },
  {
    "s": {
      "c": 48,
      "r": 2
    },
    "e": {
      "c": 48,
      "r": 3
    }
  },
  {
    "s": {
      "c": 49,
      "r": 2
    },
    "e": {
      "c": 49,
      "r": 3
    }
  },
  {
    "s": {
      "c": 50,
      "r": 2
    },
    "e": {
      "c": 50,
      "r": 3
    }
  },
  {
    "s": {
      "c": 51,
      "r": 2
    },
    "e": {
      "c": 51,
      "r": 3
    }
  },
  {
    "s": {
      "c": 52,
      "r": 2
    },
    "e": {
      "c": 52,
      "r": 3
    }
  },
  {
    "s": {
      "c": 35,
      "r": 2
    },
    "e": {
      "c": 35,
      "r": 3
    }
  },
  {
    "s": {
      "c": 36,
      "r": 2
    },
    "e": {
      "c": 36,
      "r": 3
    }
  },
  {
    "s": {
      "c": 37,
      "r": 2
    },
    "e": {
      "c": 37,
      "r": 3
    }
  },
  {
    "s": {
      "c": 38,
      "r": 2
    },
    "e": {
      "c": 38,
      "r": 3
    }
  },
  {
    "s": {
      "c": 39,
      "r": 2
    },
    "e": {
      "c": 39,
      "r": 3
    }
  },
  {
    "s": {
      "c": 40,
      "r": 2
    },
    "e": {
      "c": 40,
      "r": 3
    }
  },
  {
    "s": {
      "c": 41,
      "r": 2
    },
    "e": {
      "c": 41,
      "r": 3
    }
  },
  {
    "s": {
      "c": 42,
      "r": 2
    },
    "e": {
      "c": 42,
      "r": 3
    }
  },
  {
    "s": {
      "c": 43,
      "r": 2
    },
    "e": {
      "c": 43,
      "r": 3
    }
  },
  {
    "s": {
      "c": 44,
      "r": 2
    },
    "e": {
      "c": 44,
      "r": 3
    }
  },
  {
    "s": {
      "c": 53,
      "r": 2
    },
    "e": {
      "c": 53,
      "r": 3
    }
  },
  {
    "s": {
      "c": 54,
      "r": 2
    },
    "e": {
      "c": 54,
      "r": 3
    }
  },
  {
    "s": {
      "c": 95,
      "r": 2
    },
    "e": {
      "c": 95,
      "r": 3
    }
  },
  {
    "s": {
      "c": 96,
      "r": 2
    },
    "e": {
      "c": 96,
      "r": 3
    }
  },
  {
    "s": {
      "c": 97,
      "r": 2
    },
    "e": {
      "c": 97,
      "r": 3
    }
  },
  {
    "s": {
      "c": 121,
      "r": 1
    },
    "e": {
      "c": 121,
      "r": 2
    }
  },
  {
    "s": {
      "c": 133,
      "r": 1
    },
    "e": {
      "c": 133,
      "r": 2
    }
  },
  {
    "s": {
      "c": 134,
      "r": 2
    },
    "e": {
      "c": 134,
      "r": 3
    }
  },
  {
    "s": {
      "c": 135,
      "r": 2
    },
    "e": {
      "c": 135,
      "r": 3
    }
  }
];
  ws['!merges'] = merges;

  XLSX.utils.book_append_sheet(wb, ws, 'Survey Data');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  XLSX.writeFile(wb, \`Household_Survey_\${filterType}_\${timestamp}.xlsx\`);
}
`;

fs.writeFileSync('packages/shared/src/utils/exportToExcel.ts', code);
console.log('Successfully wrote exportToExcel.ts');
