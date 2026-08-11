import { fetchAllSurveysForExport } from '../packages/shared/src/syncService';
import { generateCareExcel } from '../packages/shared/src/utils/exportToExcel';

async function testExport() {
  const dummySurvey = {
    id: 'test-survey',
    household: {
      date: '2024-01-01',
      staff_name: 'Test Staff'
    },
    members: [
      {
        id: 'member-1',
        name: 'Test Member',
        age: 30
      }
    ],
    documents: {
      'member-1': {
        aadhaar_card: true,
        ration_card: false
      }
    },
    corrections: {
      'member-1': {
        aadhaar_card: true
      }
    },
    corrections_made: {},
    new_docs: {},
    base_docs: {},
    schemes: {},
    status: 'synced'
  };

  try {
    generateCareExcel([dummySurvey as any], 'all');
    console.log('Export successful');
  } catch(e) {
    console.error('Export failed', e);
  }
}

testExport();
