import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Verisphere database...');

  // Clean existing data
  await prisma.investigationContribution.deleteMany();
  await prisma.investigation.deleteMany();
  await prisma.opinionComment.deleteMany();
  await prisma.opinionPost.deleteMany();
  await prisma.evidenceItem.deleteMany();
  await prisma.forumComment.deleteMany();
  await prisma.forumThread.deleteMany();
  await prisma.knowledgeArticle.deleteMany();
  await prisma.officialComplaint.deleteMany();
  await prisma.officialControversy.deleteMany();
  await prisma.officialPromise.deleteMany();
  await prisma.official.deleteMany();
  await prisma.civicReportFile.deleteMany();
  await prisma.civicReport.deleteMany();
  await prisma.submissionFile.deleteMany();
  await prisma.whistleblowerSubmission.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  const adminHash = await bcrypt.hash('admin123', 10);
  const citizenHash = await bcrypt.hash('citizen123', 10);
  const citizen2Hash = await bcrypt.hash('citizen123', 10);

  const admin = await prisma.user.create({
    data: { username: 'admin', passwordHash: adminHash, displayName: 'System Admin', role: 'admin' },
  });
  const citizen = await prisma.user.create({
    data: { username: 'citizen', passwordHash: citizenHash, displayName: 'Aminul Haque' },
  });
  const citizen2 = await prisma.user.create({
    data: { username: 'farida_k', passwordHash: citizen2Hash, displayName: 'Farida Khatun' },
  });

  console.log('  ✓ Users created');

  // --- Officials ---
  const official1 = await prisma.official.create({
    data: {
      name: 'Rafiqul Islam',
      position: 'District Commissioner',
      institution: 'Dhaka District Administration',
      bio: '**Rafiqul Islam** has served as District Commissioner since 2022. He oversees the administrative functions of the Dhaka district, including land management, disaster relief coordination, and law enforcement oversight.\n\n## Background\n- Previously served as Additional Deputy Commissioner in Chittagong\n- Master\'s in Public Administration from University of Dhaka\n- 18 years in civil service',
    },
  });

  const official2 = await prisma.official.create({
    data: {
      name: 'Nasreen Akter',
      position: 'City Corporation Mayor',
      institution: 'Rajshahi City Corporation',
      bio: '**Nasreen Akter** was elected Mayor in the 2023 municipal elections. She ran on a platform of urban infrastructure improvement and anti-corruption measures.\n\n## Key Focus Areas\n- Road and drainage infrastructure\n- Municipal waste management reform\n- Digital citizen services',
    },
  });

  const official3 = await prisma.official.create({
    data: {
      name: 'Dr. Kamal Uddin',
      position: 'Director General',
      institution: 'Department of Environment',
      bio: '**Dr. Kamal Uddin** has led the Department of Environment since 2021. A career environmental scientist, he holds a PhD in Environmental Engineering from BUET.\n\n## Responsibilities\n- Environmental impact assessments\n- Industrial emission standards\n- Climate change adaptation policies',
    },
  });

  console.log('  ✓ Officials created');

  // --- Official Promises ---
  await prisma.officialPromise.createMany({
    data: [
      { officialId: official1.id, text: 'Complete digitization of land records by 2025', status: 'pending' },
      { officialId: official1.id, text: 'Establish citizen complaint hotline within 6 months', status: 'kept' },
      { officialId: official1.id, text: 'Reduce average permit processing time to 7 days', status: 'broken' },
      { officialId: official2.id, text: 'Repair all major road potholes within the first year', status: 'pending' },
      { officialId: official2.id, text: 'Introduce online tax payment portal', status: 'kept' },
      { officialId: official2.id, text: 'Build 5 new public parks in underserved areas', status: 'pending' },
      { officialId: official3.id, text: 'Publish real-time air quality data for all divisional cities', status: 'pending' },
      { officialId: official3.id, text: 'Enforce mandatory EIA for all industrial projects', status: 'kept' },
    ],
  });

  console.log('  ✓ Official promises created');

  // --- Official Controversies ---
  await prisma.officialControversy.createMany({
    data: [
      {
        officialId: official1.id,
        title: 'Land Allocation Irregularity Allegations',
        description: 'Multiple citizens have alleged that prime agricultural land was re-classified as commercial without proper environmental review or public consultation. Local advocacy groups have filed RTI requests for related documents.',
        sourceUrl: 'https://example.com/land-controversy',
      },
      {
        officialId: official2.id,
        title: 'Municipal Contract Award Questions',
        description: 'A road construction contract worth BDT 50 crore was awarded to a firm with no prior municipal experience. Opposition council members have demanded a public audit of the bidding process.',
        sourceUrl: 'https://example.com/contract-questions',
      },
      {
        officialId: official3.id,
        title: 'Delayed Enforcement on Textile Factory Emissions',
        description: 'Environmental groups have criticized the Department for issuing repeated warnings to a major textile factory without taking enforcement action despite documented violations over 18 months.',
        sourceUrl: 'https://example.com/emission-delays',
      },
    ],
  });

  console.log('  ✓ Official controversies created');

  // --- Civic Reports ---
  const reportCategories = ['corruption', 'abuse_of_authority', 'human_rights', 'environment', 'public_service', 'misuse_of_resources', 'infrastructure', 'election'];

  const reports = await Promise.all([
    prisma.civicReport.create({
      data: {
        authorId: citizen.id,
        title: 'Irregular permit approvals at Dhaka North building authority',
        description: '## Summary\nBuilding permits are being approved without proper inspection for structures exceeding 8 stories in Uttara sector 11. Three buildings in the area have visible structural concerns.\n\n## Details\n- Permits issued within 48 hours of application (normal processing is 30 days)\n- No record of site inspections in public registry\n- Affected buildings: Plot 15, 23, and 41 in Sector 11\n\n## Evidence\nRTI request filed on March 15 — response overdue by 45 days.',
        category: 'corruption',
        location: 'Uttara, Dhaka North',
        incidentDate: new Date('2026-03-10'),
        status: 'under_review',
      },
    }),
    prisma.civicReport.create({
      data: {
        authorId: citizen2.id,
        title: 'Untreated industrial waste discharge into Buriganga River',
        description: '## Observation\nAt least three tannery operations near Hazaribagh continue to discharge untreated effluent directly into the Buriganga. Despite the 2017 relocation order, remnant operations persist.\n\n## Environmental Impact\n- Water color visibly dark/discolored for 500m stretch\n- Fish populations absent in affected area\n- Nearby residents report skin conditions\n\n## Documentation\nPhotographs taken on June 1 and June 15 showing discharge points.',
        category: 'environment',
        location: 'Hazaribagh, Dhaka',
        incidentDate: new Date('2026-06-01'),
        status: 'received',
      },
    }),
    prisma.civicReport.create({
      data: {
        authorId: citizen.id,
        title: 'Public hospital medicine shortage — Rajshahi Medical College',
        description: '## Issue\nEssential medicines listed on the government\'s essential drug list have been unavailable at Rajshahi Medical College Hospital pharmacy for the past 3 months. Patients are being directed to purchase from private pharmacies.\n\n## Affected Medicines\n- Metformin (diabetes)\n- Amlodipine (hypertension)\n- Basic antibiotics (Amoxicillin)\n\n## Patient Impact\nLow-income patients who rely on free hospital medicines are unable to afford private pharmacy prices.',
        category: 'public_service',
        location: 'Rajshahi Medical College Hospital',
        incidentDate: new Date('2026-04-20'),
        status: 'resolved',
      },
    }),
    prisma.civicReport.create({
      data: {
        authorId: null,
        title: 'Road construction funds misappropriation in Sylhet',
        description: '## Allegation\nA portion of funds allocated for Sylhet-Sunamganj highway repair appear to have been diverted. The completed road section shows significantly lower quality than specifications.\n\n## Evidence\n- Road surface cracking within 6 months of completion\n- Actual road width measures 18ft vs. contracted 24ft\n- Local contractors report being paid only 60% of quoted amounts',
        category: 'misuse_of_resources',
        location: 'Sylhet-Sunamganj Highway',
        incidentDate: new Date('2026-02-15'),
        status: 'under_review',
      },
    }),
    prisma.civicReport.create({
      data: {
        authorId: citizen2.id,
        title: 'Voter intimidation reported during municipal by-election',
        description: '## Incident\nMultiple voters in Ward 7 reported being approached by unidentified individuals outside polling stations who attempted to influence their vote through implicit threats.\n\n## Details\n- Incidents reported between 10 AM and 2 PM on election day\n- At least 12 voters filed verbal complaints with presiding officers\n- No formal FIR filed as of this report',
        category: 'election',
        location: 'Ward 7, Chattogram City Corporation',
        incidentDate: new Date('2026-05-12'),
        status: 'received',
      },
    }),
    prisma.civicReport.create({
      data: {
        authorId: citizen.id,
        title: 'Police excessive force during peaceful demonstration',
        description: '## Incident\nDuring a licensed peaceful demonstration by garment workers demanding unpaid wages, police used tear gas and baton charges without provocation or warning.\n\n## Details\n- Demonstration had valid permission from local authority\n- Approximately 200 workers were participating peacefully\n- 15 workers required medical treatment\n- Video evidence available from multiple bystanders',
        category: 'human_rights',
        location: 'Ashulia Industrial Area, Dhaka',
        incidentDate: new Date('2026-06-20'),
        status: 'received',
      },
    }),
    prisma.civicReport.create({
      data: {
        authorId: null,
        title: 'Collapsed drainage system causing flooding in residential area',
        description: '## Problem\nThe drainage system in Mirpur Section 12 has been non-functional for 8 months, causing severe waterlogging during every rain event.\n\n## Impact\n- 500+ households affected\n- Water enters ground floor residences during moderate rainfall\n- Multiple written complaints to City Corporation have gone unanswered\n- Health concerns: mosquito breeding, contaminated water exposure',
        category: 'infrastructure',
        location: 'Mirpur Section 12, Dhaka',
        incidentDate: new Date('2026-01-10'),
        status: 'received',
      },
    }),
    prisma.civicReport.create({
      data: {
        authorId: citizen2.id,
        title: 'Unauthorized use of government vehicles for personal travel',
        description: '## Observation\nGovernment-plate vehicles assigned to the Department of Education are regularly observed at private events and personal errands during office hours.\n\n## Evidence\n- Vehicle registration numbers documented on 5 separate occasions\n- Locations include shopping malls, private residences, and wedding venues\n- Pattern observed over 3-month period (March-May 2026)',
        category: 'abuse_of_authority',
        location: 'Dhaka Division',
        incidentDate: new Date('2026-05-30'),
        status: 'received',
      },
    }),
  ]);

  console.log('  ✓ Civic reports created');

  // --- Official Complaints (linking reports to officials) ---
  await prisma.officialComplaint.createMany({
    data: [
      { officialId: official1.id, reportId: reports[0].id, text: 'Building permits issued without proper oversight under your jurisdiction.' },
      { officialId: official2.id, reportId: reports[2].id, text: 'Hospital under your municipal authority lacks essential medicines.' },
      { officialId: official3.id, reportId: reports[1].id, text: 'Continued industrial discharge despite environmental regulations.' },
      { officialId: official1.id, text: 'General complaint about slow response to RTI requests.' },
    ],
  });

  console.log('  ✓ Official complaints created');

  // --- Knowledge Articles ---
  await prisma.knowledgeArticle.createMany({
    data: [
      {
        title: 'Your Right to Information: A Citizen\'s Guide',
        category: 'legal_rights',
        content: '# Right to Information Act, 2009\n\nEvery citizen of Bangladesh has the right to access information from public authorities under the **Right to Information Act, 2009**.\n\n## How to File an RTI Request\n\n1. **Identify the authority** — Determine which government office holds the information you need.\n2. **Write your application** — Address it to the Designated Officer of that authority.\n3. **Include required details:**\n   - Your name and contact information\n   - Specific description of the information sought\n   - Preferred format (photocopy, electronic, etc.)\n4. **Submit and pay fee** — BDT 10 application fee (postal order or bank draft)\n5. **Wait for response** — The authority must respond within **20 working days**\n\n## What If Your Request Is Denied?\n\n- You can appeal to the authority head within 30 days\n- If still unsatisfied, appeal to the **Information Commission** within 60 days\n- The Commission\'s decision is binding\n\n## Exemptions\n\nSome information is exempt, including national security matters, pending investigations, and personal privacy-protected data.',
        authorId: admin.id,
      },
      {
        title: 'How to File a Public Interest Litigation (PIL)',
        category: 'legal_rights',
        content: '# Public Interest Litigation in Bangladesh\n\nPublic Interest Litigation (PIL) allows any citizen to approach the **High Court Division** on behalf of the public when fundamental rights are being violated.\n\n## Who Can File?\n\nUnlike regular lawsuits, a PIL can be filed by **any person** — you don\'t need to be personally affected by the issue.\n\n## Steps to File\n\n1. **Document the issue** — Gather evidence of the rights violation or public harm\n2. **Draft the petition** — Describe the violation, affected population, and relief sought\n3. **Engage a lawyer** — While not strictly required, legal representation is strongly recommended\n4. **File with the High Court** — Submit the petition with supporting documents\n\n## Landmark PILs in Bangladesh\n\n- Environmental protection cases against industrial pollution\n- Cases challenging illegal land grabbing\n- Workers\' rights enforcement cases\n\n## Cost\n\nPILs typically have minimal court fees, making them accessible to citizens regardless of economic status.',
        authorId: admin.id,
      },
      {
        title: 'Understanding the Anti-Corruption Commission',
        category: 'governance',
        content: '# The Anti-Corruption Commission (ACC)\n\nThe ACC is an independent body established under the **Anti-Corruption Commission Act, 2004** to prevent, investigate, and prosecute corruption.\n\n## How to Report Corruption to the ACC\n\n### In Person\n- Visit the ACC head office in Dhaka or any divisional office\n- Fill out a complaint form with details of the allegation\n\n### Online\n- Submit through the ACC website\'s complaint portal\n- Include any documentary evidence\n\n### Hotline\n- National Anti-Corruption Hotline: 106\n\n## What Happens After You Report?\n\n1. **Preliminary assessment** — ACC reviews the complaint for credibility\n2. **Inquiry** — If credible, a formal inquiry is initiated\n3. **Investigation** — If inquiry finds substance, a full investigation follows\n4. **Prosecution** — Cases are filed in designated courts\n\n## Whistleblower Protection\n\nThe ACC is mandated to protect the identity of complainants. However, practical enforcement of whistleblower protection remains an area of ongoing concern.',
        authorId: admin.id,
      },
      {
        title: 'Digital Security Act: What Citizens Should Know',
        category: 'legal_rights',
        content: '# Digital Security Act, 2018\n\nThe Digital Security Act governs cyberspace activities and digital communication in Bangladesh.\n\n## Key Provisions Relevant to Citizens\n\n### Online Expression\n- Publishing information that is \"offensive\" or \"threatening\" can carry penalties\n- Defamation through digital means is a criminal offense\n\n### Important Safeguards\n- Law enforcement requires a **warrant** for digital surveillance (in most cases)\n- Citizens have the right to know if their data has been accessed\n\n## Exercising Digital Rights Responsibly\n\n1. **Document, don\'t defame** — Focus on factual reporting when highlighting issues\n2. **Use official channels** — File formal complaints rather than social media accusations\n3. **Preserve evidence properly** — Screenshots with metadata, timestamps, and context\n4. **Understand fair comment** — Genuine public interest commentary is distinct from defamation\n\n## Seeking Help\n\nIf you face legal action under the DSA, contact:\n- Bangladesh Legal Aid and Services Trust (BLAST)\n- Ain o Salish Kendra (ASK)\n- Your local bar association for pro bono assistance',
        authorId: admin.id,
      },
    ],
  });

  console.log('  ✓ Knowledge articles created');

  // --- Forum Threads & Comments ---
  const thread1 = await prisma.forumThread.create({
    data: {
      title: 'How effective is the RTI Act in practice?',
      body: 'I\'ve been trying to get information about road construction budgets in my upazila through RTI requests. Filed my first request 3 months ago and still haven\'t received a response. The designated officer keeps saying the information is "being compiled."\n\nHas anyone successfully used the RTI Act? What strategies work best for getting timely responses?\n\nI\'m starting to think the Act is strong on paper but weak in practice.',
      authorId: citizen.id,
    },
  });

  await prisma.forumComment.createMany({
    data: [
      {
        threadId: thread1.id,
        authorId: citizen2.id,
        body: 'I\'ve had mixed results. For simple requests (budget allocations, staff lists), I usually get responses within 30 days. For anything politically sensitive, delays are common.\n\n**What worked for me:**\n- Be very specific in your request — vague requests get vague delays\n- Send the request by registered post so you have proof of receipt\n- Follow up with a written reminder after 20 working days\n- If no response, immediately file an appeal with the authority head',
      },
      {
        threadId: thread1.id,
        authorId: admin.id,
        body: 'The Information Commission publishes annual reports on RTI compliance. Last year, the average response time was 28 working days — better than many countries, but still above the 20-day legal requirement.\n\nOne practical tip: some authorities have designated email addresses for RTI requests now. Digital submissions create automatic timestamps that are harder to dispute.',
      },
    ],
  });

  const thread2 = await prisma.forumThread.create({
    data: {
      title: 'Community organizing for better waste management',
      body: 'Our neighborhood in Dhanmondi has been dealing with irregular waste collection for months. We\'ve decided to organize as a community to address this.\n\n## What we\'ve done so far\n1. Documented the issue (photos, dates of missed collections)\n2. Collected signatures from 150 households\n3. Written a formal complaint to the ward councilor\n\n## What we need help with\n- Has anyone successfully gotten their waste collection schedule improved?\n- Are there legal mechanisms beyond formal complaints?\n- Should we approach media or keep working through official channels?\n\nAny advice from communities that have dealt with similar issues would be greatly appreciated.',
      authorId: citizen2.id,
    },
  });

  await prisma.forumComment.createMany({
    data: [
      {
        threadId: thread2.id,
        authorId: citizen.id,
        body: 'Great initiative. In our area (Mohammadpur), we formed a residents\' welfare association and that gave us more formal standing when dealing with the City Corporation. Having a registered organization makes your complaints carry more weight.\n\nAlso, try attending the ward-level budget meetings — you can raise waste management as a priority issue for next year\'s allocation.',
      },
    ],
  });

  const thread3 = await prisma.forumThread.create({
    data: {
      title: 'Transparency in education budget allocation',
      body: 'As a parent and concerned citizen, I want to understand how education budgets are allocated at the upazila level. The published national budget gives top-line figures, but I can\'t find how funds flow to individual schools.\n\nSpecifically:\n- How is the per-student allocation calculated?\n- Who decides which schools get infrastructure development funds?\n- Is there a mechanism for parents to audit how their local school spends government allocations?\n\nIf anyone has experience navigating education budget transparency, please share.',
      authorId: citizen.id,
    },
  });

  const thread4 = await prisma.forumThread.create({
    data: {
      title: 'Best practices for documenting civic issues',
      body: 'I\'ve been reporting civic issues for a while and have learned some things about effective documentation.\n\n## Tips for documenting issues\n\n1. **Photographs**: Always include a reference point for scale. Include street signs or landmarks for location verification.\n2. **Timestamps**: Use your camera\'s automatic timestamp. If possible, capture a screenshot of your phone\'s clock alongside the issue.\n3. **Written records**: Keep a log with dates, times, and descriptions. Be factual, not emotional.\n4. **Witnesses**: Note names and contact details of anyone else who observed the issue.\n5. **Official correspondence**: Keep copies of all letters, emails, and complaint numbers.\n\nWhat other tips do people have?',
      authorId: citizen2.id,
    },
  });

  const thread5 = await prisma.forumThread.create({
    data: {
      title: 'Environmental monitoring: citizen science opportunities',
      body: 'I\'m interested in participating in citizen science projects related to environmental monitoring in Bangladesh. I know the DoE has official monitoring stations, but coverage is limited.\n\nAreas I\'m interested in:\n- Air quality monitoring (affordable sensors are now available)\n- Water quality testing in urban waterways\n- Noise pollution mapping\n\nAre there any existing citizen science networks in Bangladesh? If not, would others be interested in starting one?',
      authorId: citizen.id,
    },
  });

  console.log('  ✓ Forum threads and comments created');

  // --- Evidence Items ---
  await prisma.evidenceItem.createMany({
    data: [
      {
        title: 'Buriganga River discharge documentation — June 2026',
        description: 'Photographic evidence of industrial effluent discharge points along the Hazaribagh stretch of the Buriganga River. Photos taken over two weeks showing consistent discharge patterns.',
        filePath: '/uploads/placeholder-evidence-1.pdf',
        originalName: 'buriganga-discharge-photos-june2026.pdf',
        fileType: 'application/pdf',
        category: 'environment',
        sourceRef: 'Field documentation by local environmental group',
        uploadedById: citizen.id,
      },
      {
        title: 'Road quality comparison — Sylhet highway',
        description: 'Side-by-side photographs comparing the contracted road specifications with actual construction quality on the Sylhet-Sunamganj highway.',
        filePath: '/uploads/placeholder-evidence-2.pdf',
        originalName: 'sylhet-road-comparison.pdf',
        fileType: 'application/pdf',
        category: 'infrastructure',
        sourceRef: 'Citizen documentation project',
        uploadedById: citizen2.id,
      },
      {
        title: 'RTI Response Analysis — Land Records Digitization',
        description: 'Compiled responses to RTI requests filed with 15 district offices regarding the status of land record digitization. Shows significant variation in reported progress vs. actual digital accessibility.',
        filePath: '/uploads/placeholder-evidence-3.pdf',
        originalName: 'rti-analysis-land-records.pdf',
        fileType: 'application/pdf',
        category: 'governance',
        sourceRef: 'Transparency Bangladesh research',
        uploadedById: admin.id,
      },
      {
        title: 'Ward 7 by-election incident report compilation',
        description: 'Compiled statements from 12 voters who reported intimidation during the Chattogram Ward 7 by-election. Includes timeline of events and summary of each incident.',
        filePath: '/uploads/placeholder-evidence-4.pdf',
        originalName: 'ward7-election-incidents.pdf',
        fileType: 'application/pdf',
        category: 'election',
        sourceRef: 'Election Monitoring Forum',
        uploadedById: citizen2.id,
      },
      {
        title: 'Hospital medicine availability audit — Q1 2026',
        description: 'Audit of essential medicine availability across 8 public hospitals in Rajshahi division. Conducted by volunteer pharmacists over a 3-month period.',
        filePath: '/uploads/placeholder-evidence-5.pdf',
        originalName: 'medicine-audit-q1-2026.pdf',
        fileType: 'application/pdf',
        category: 'public_service',
        sourceRef: 'Public Health Watch volunteer network',
        uploadedById: citizen.id,
      },
    ],
  });

  console.log('  ✓ Evidence items created');

  // --- Opinion Posts & Comments ---
  const opinion1 = await prisma.opinionPost.create({
    data: {
      title: 'Why citizen journalism matters more than ever',
      body: '# Why Citizen Journalism Matters\n\nIn an era where traditional media faces economic pressures and editorial constraints, citizen journalism has emerged as a critical supplement to professional reporting.\n\n## The Role of Citizens in Accountability\n\nEvery citizen with a smartphone is a potential documentarian. When professional journalists cannot be everywhere, ordinary people fill the gap by:\n\n- **Documenting local issues** that don\'t make national headlines\n- **Providing ground-level perspective** that institutional reporting often misses\n- **Creating accountability pressure** through persistent, public documentation\n\n## Responsibilities of Citizen Journalists\n\nWith this power comes responsibility:\n\n1. **Verify before sharing** — Confirm facts through multiple sources\n2. **Distinguish observation from opinion** — Be clear about what you witnessed vs. what you believe\n3. **Respect privacy** — Protect vulnerable individuals in your reporting\n4. **Seek official responses** — Always give the subject of your report an opportunity to respond\n\n## Platforms Like This One\n\nPlatforms that combine citizen reporting with evidence archiving and community discussion create an ecosystem where individual observations become collective knowledge. The whole becomes greater than the sum of its parts.\n\nThe question is not whether citizen journalism is legitimate — it is whether we can do it *well*.',
      authorId: citizen.id,
    },
  });

  await prisma.opinionComment.createMany({
    data: [
      {
        opinionId: opinion1.id,
        authorId: citizen2.id,
        body: 'Well said. I would add that citizen journalism also needs to be protected by stronger whistleblower laws. Many people want to report but fear retaliation. Until we address that fear, we won\'t see the full potential of civic reporting.',
      },
      {
        opinionId: opinion1.id,
        authorId: admin.id,
        body: 'Important points about responsibility. The credibility of citizen journalism depends entirely on accuracy and fairness. One inaccurate viral report can undermine trust in all citizen-generated content.',
      },
    ],
  });

  await prisma.opinionPost.create({
    data: {
      title: 'Rethinking public consultation in urban planning',
      body: '# Public Consultation: Beyond the Checkbox\n\nUrban development projects in Bangladesh routinely include "public consultation" as a procedural requirement. But how meaningful are these consultations?\n\n## The Current Problem\n\nTypical public consultations suffer from:\n- **Late timing** — Consultations happen after key decisions are made\n- **Low accessibility** — Held during working hours in inconvenient locations\n- **Language barriers** — Documents in technical English, not accessible Bangla\n- **No feedback loop** — Citizens never learn how their input influenced decisions\n\n## A Better Model\n\nEffective public consultation should:\n\n1. Start at the **planning stage**, not the approval stage\n2. Use **multiple channels** — in-person, online, written submissions\n3. Provide documents in **plain language**\n4. Publish a **response document** explaining how public input was incorporated or why it wasn\'t\n\nUntil we treat public consultation as a genuine dialogue rather than a bureaucratic formality, urban development will continue to serve narrow interests rather than the broader public good.',
      authorId: citizen2.id,
    },
  });

  await prisma.opinionPost.create({
    data: {
      title: 'The case for open government data',
      body: '# Open Data: A Foundation for Accountability\n\nGovernment data — budgets, procurement records, environmental measurements, service delivery statistics — belongs to the public. Making this data freely available in machine-readable formats would transform accountability.\n\n## Benefits of Open Data\n\n### For Citizens\n- Verify government claims with actual numbers\n- Identify patterns of resource allocation\n- Compare service delivery across regions\n\n### For Government\n- Build public trust through transparency\n- Enable external analysis that improves policy\n- Reduce corruption through sunlight\n\n### For Researchers\n- Evidence-based policy recommendations\n- Longitudinal studies of governance quality\n- International comparative analysis\n\n## Current State\n\nBangladesh has made progress with the National Data Portal, but:\n- Many datasets are outdated or incomplete\n- Formats are often PDF (not machine-readable)\n- Update frequency is inconsistent\n\n## The Path Forward\n\nA formal Open Data Policy with mandatory publication schedules, standardized formats, and accountability for non-compliance would be a significant step toward genuine transparency.',
      authorId: citizen.id,
    },
  });

  console.log('  ✓ Opinion posts and comments created');

  // --- Whistleblower Submissions ---
  await prisma.whistleblowerSubmission.create({
    data: {
      trackingCode: 'WB-DEMO-0001',
      submitterId: null, // anonymous
      title: 'Procurement fraud in district health office',
      description: '## Allegation\n\nThe district health office in [location redacted] has been submitting inflated invoices for medical equipment purchases. The actual equipment received is of significantly lower quality than what is invoiced.\n\n## Specific Instances\n- Invoiced 50 oxygen concentrators at BDT 2,00,000 each; received units appear to be refurbished models worth approximately BDT 50,000\n- Surgical supplies invoiced at 3x market rate\n\n## Pattern\nThis has been occurring for at least 2 fiscal years based on documents I have access to.',
      category: 'corruption',
      status: 'under_review',
    },
  });

  await prisma.whistleblowerSubmission.create({
    data: {
      trackingCode: 'WB-DEMO-0002',
      submitterId: citizen.id,
      title: 'Illegal sand mining in protected riverbank area',
      description: '## Report\n\nCommercial sand mining is occurring in a designated protected area along the Padma River near [location]. Operations run nightly between 11 PM and 4 AM using heavy machinery.\n\n## Concerns\n- Riverbank erosion threatening nearby villages\n- Protected fish breeding grounds being destroyed\n- Local administration appears to be aware but not acting\n\n## Evidence Available\n- GPS coordinates of mining sites\n- Photographs of machinery and trucks\n- Estimated volume of sand removed',
      category: 'environment',
      status: 'received',
    },
  });

  await prisma.whistleblowerSubmission.create({
    data: {
      trackingCode: 'WB-DEMO-0003',
      submitterId: null, // anonymous
      title: 'Ghost employees on government payroll',
      description: '## Disclosure\n\nA government department maintains at least 15 "ghost employees" — individuals who are on the payroll and receive salaries but do not actually work or exist.\n\n## Details\n- Monthly salary disbursements go to bank accounts that appear to be controlled by department officials\n- Total estimated annual loss: BDT 90 lakh\n- The practice has continued for at least 3 years\n\n## Documentation\nI have copies of attendance records that show these employees as "on duty" despite never being physically present.',
      category: 'misuse_of_resources',
      status: 'received',
    },
  });

  console.log('  ✓ Whistleblower submissions created');

  console.log('\n✅ Seed complete!');
  console.log('\nDemo credentials:');
  console.log('  Admin:   username=admin,   password=admin123');
  console.log('  Citizen: username=citizen,  password=citizen123');
  console.log('  Citizen: username=farida_k, password=citizen123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
