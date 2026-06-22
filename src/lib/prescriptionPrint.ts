export interface PrintPatient {
  name: string;
  age?: number | string;
  gender?: string;
  mrn?: string;
}

export interface PrintMedicine {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  time?: string;
  startTime?: string;
}

export interface PrintPrescription {
  date?: string;
  medicines: PrintMedicine[];
  advice?: string;
  diagnosis?: string;
  notes?: string;
}

export interface PrintDoctor {
  name?: string;
  degree?: string;
  specialization?: string;
  department?: string;
  id?: string;
}

export function getPrescriptionPrintHtml(
  patient: PrintPatient,
  prescription: PrintPrescription,
  doctor?: PrintDoctor,
  hospitalInfo?: { name: string; address: string; phone: string },
  templateImage?: string | null
): string {
  const actualTemplateImage = templateImage !== undefined ? templateImage : (typeof window !== 'undefined' ? localStorage.getItem('hms_template_image') : null);

  // Parse whether there is a valid custom preprinted background letterhead image (to overlay on)
  const isValidTemplateImage = !!(
    actualTemplateImage &&
    typeof actualTemplateImage === 'string' &&
    actualTemplateImage.trim() !== '' &&
    actualTemplateImage !== 'null' &&
    actualTemplateImage !== 'undefined' &&
    (actualTemplateImage.startsWith('http') || actualTemplateImage.startsWith('data:image') || actualTemplateImage.startsWith('/'))
  );

  const hospName = hospitalInfo?.name || 'GLOBAL HOSPITAL';
  const hospAddress = hospitalInfo?.address || '123 Healthcare Way, Medical City';
  const hospPhone = hospitalInfo?.phone || '+91 98765 43210';
  const hospEmail = `contact@${hospName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'globalhospital'}.com`;
  
  const patName = patient?.name || 'N/A';
  const patAgeGender = `${patient?.age || 'N/A'}Y / ${patient?.gender || 'N/A'}`;
  const presDate = prescription?.date || new Date().toISOString().split('T')[0];
  const patMRN = patient?.mrn || 'N/A';

  const docName = doctor?.name || 'Attending Doctor';
  const docReg = doctor?.degree ? `Reg No: MC-${doctor.id?.toUpperCase() || '1234567'}` : 'Reg No: MC1234567';
  const docSpecialty = doctor?.specialization || doctor?.department || 'Senior Consultant';

  // Format Medicines content
  let medContent = '';
  if (prescription.medicines && prescription.medicines.length > 0) {
    medContent = prescription.medicines.map(m => `
      <tr style="border-bottom: 1.5px solid #e2e8f0; page-break-inside: avoid;">
        <td style="padding: 16px 14px; font-weight: 700; color: #0f172a; font-size: 14px;">${m.name}</td>
        <td style="padding: 16px 14px; font-weight: 600; color: #334155; font-size: 14px;">${m.dosage || '-'}</td>
        <td style="padding: 16px 14px; font-weight: 600; color: #334155; font-size: 14px;">${m.frequency || '-'}</td>
        <td style="padding: 16px 14px; font-weight: 600; color: #334155; font-size: 14px;">${m.duration || '-'}</td>
      </tr>
    `).join('');
  } else {
    // Return high-quality empty lines with dotted borders for the blank pad to look beautiful when printed
    for (let i = 0; i < 6; i++) {
      medContent += `
        <tr style="border-bottom: 1px dotted #cbd5e1; height: 52px; page-break-inside: avoid;">
          <td style="padding: 16px 14px;"></td>
          <td style="padding: 16px 14px;"></td>
          <td style="padding: 16px 14px;"></td>
          <td style="padding: 16px 14px;"></td>
        </tr>
      `;
    }
  }

  const adviceContent = (prescription.advice || prescription.notes || prescription.diagnosis) ? `
    <div style="margin-top: 30px; font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; page-break-inside: avoid;">
      <div style="font-weight: 800; font-size: 10px; text-transform: uppercase; color: #475569; letter-spacing: 0.08em; margin-bottom: 8px;">Clinical Remarks & Advice:</div>
      <div style="font-size: 13.5px; color: #1e293b; font-weight: 500; line-height: 1.6; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; border-left: 4px solid #0284c7;">
        ${prescription.diagnosis ? `<div style="font-weight: 800; color: #0f172a; margin-bottom: 6px; font-size: 13.5px;">Diagnosis: ${prescription.diagnosis}</div>` : ''}
        ${prescription.advice || prescription.notes || ''}
      </div>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Prescription - ${patName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');
          
          @page {
            size: A4;
            margin: 15mm 15mm 18mm 15mm;
          }
          body {
            font-family: 'Plus Jakarta Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            color: #0f172a;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background-color: #fff;
            position: relative;
          }
          .template-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
          }
          .container {
            width: 100%;
            min-height: 250mm;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            padding-top: ${isValidTemplateImage ? '240px' : '0px'};
          }
          
          /* Custom Premium Letterhead styling */
          .header {
            display: ${isValidTemplateImage ? 'none' : 'block'};
            margin-bottom: 22px;
          }
          .header-grid {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }
          .logo-area {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .hosp-icon {
            width: 48px;
            height: 48px;
            color: #0284c7;
          }
          .hosp-titles {
            display: flex;
            flex-direction: column;
          }
          .hosp-name {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 24px;
            font-weight: 800;
            margin: 0;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            color: #0f172a;
            line-height: 1.1;
          }
          .hosp-tagline {
            font-size: 9px;
            font-weight: 700;
            color: #64748b;
            margin: 4px 0 0 0;
            letter-spacing: 1.5px;
            text-transform: uppercase;
          }
          .hosp-contact {
            text-align: right;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .contact-item {
            font-size: 11.5px;
            font-weight: 600;
            color: #475569;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 6px;
          }
          .contact-svg {
            width: 13px;
            height: 13px;
            color: #0284c7;
          }
          .divider {
            display: ${isValidTemplateImage ? 'none' : 'block'};
            height: 3px;
            background: linear-gradient(90deg, #0284c7 0%, #0369a1 40%, #0f172a 100%);
            border-radius: 2px;
            margin-top: 15px;
            margin-bottom: 12px;
          }
          
          /* Patient Box Grid */
          .patient-box {
            display: grid;
            grid-template-cols: 1.1fr 1fr 0.95fr 0.95fr;
            border: 1.5px solid #e2e8f0;
            border-left: 4px solid #0284c7;
            border-radius: 12px;
            padding: 13px 18px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            margin-bottom: 25px;
            box-sizing: border-box;
            gap: 15px;
          }
          .patient-field {
            display: flex;
            flex-direction: column;
            gap: 3px;
          }
          .patient-field.text-right {
            align-items: flex-end;
            text-align: right;
          }
          .info-label {
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 0.08em;
          }
          .info-value {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
          }
          
          /* Rx Symbol & Watermark */
          .rx-container {
            position: relative;
            margin-left: 2px;
          }
          .rx-symbol {
            font-size: 44px;
            font-style: italic;
            font-weight: 700;
            font-family: 'Playfair Display', Georgia, serif;
            margin: 0 0 12px 0;
            color: #0284c7;
            display: inline-block;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 300px;
            height: 300px;
            opacity: 0.02;
            z-index: -2;
            pointer-events: none;
          }
          
          /* Medicines Table Styling */
          .meds-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            z-index: 10;
          }
          .meds-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-size: 10.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            padding: 11px 14px;
            text-align: left;
          }
          .meds-table th:first-child {
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
          }
          .meds-table th:last-child {
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
          }
          
          /* Footer & Authorizations */
          .footer-section {
            margin-top: auto;
            padding-top: 35px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            page-break-inside: avoid;
            margin-bottom: 2mm;
          }
          .footer-left {
            max-width: 360px;
            border-left: 3px solid #0284c7;
            padding-left: 12px;
          }
          .footer-right {
            text-align: right;
            min-width: 230px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
          .sig-line {
            width: 180px;
            border-bottom: 1.5px solid #0f172a;
            margin-bottom: 10px;
          }
          .doc-name {
            font-size: 14.5px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 2px 0;
          }
          .doc-reg {
            font-size: 11.5px;
            color: #475569;
            margin: 0 0 2px 0;
            font-weight: 600;
          }
          .doc-spec {
            font-size: 10.5px;
            color: #64748b;
            margin: 0;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.02em;
          }
        </style>
      </head>
      <body>
        <!-- Background Premium Watermark -->
        <svg class="watermark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 10.5H13.5V5C13.5 4.17157 12.8284 3.5 12 3.5C11.1716 3.5 10.5 4.17157 10.5 5V10.5H5C4.17157 10.5 3.5 11.1716 3.5 12C3.5 12.8284 4.17157 13.5 5 13.5H10.5V19C10.5 19.8284 11.1716 20.5 12 20.5C12.8284 20.5 13.5 19.8284 13.5 19V13.5H19C19.8284 13.5 20.5 12.8284 20.5 12C20.5 11.1716 19.8284 10.5 19 10.5Z" fill="#0284c7"/>
        </svg>

        <div class="container">
          ${isValidTemplateImage ? `<div class="template-bg"><img src="${actualTemplateImage}" style="width: 100%;" /></div>` : ''}
          
          <div class="header">
            <div class="header-grid">
              <div class="logo-area">
                <!-- Premium hospital vector emblem -->
                <svg class="hosp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 10.5H13.5V5C13.5 4.17157 12.8284 3.5 12 3.5C11.1716 3.5 10.5 4.17157 10.5 5V10.5H5C4.17157 10.5 3.5 11.1716 3.5 12C3.5 12.8284 4.17157 13.5 5 13.5H10.5V19C10.5 19.8284 11.1716 20.5 12 20.5C12.8284 20.5 13.5 19.8284 13.5 19V13.5H19C19.8284 13.5 20.5 12.8284 20.5 12C20.5 11.1716 19.8284 10.5 19 10.5Z" fill="#e0f2fe"/>
                  <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z" fill="#0f172a" />
                </svg>
                <div class="hosp-titles">
                  <h1 class="hosp-name">${hospName}</h1>
                  <p class="hosp-tagline">Multispeciality Clinical Care & Quality Diagnostics</p>
                </div>
              </div>
              <div class="hosp-contact">
                <p class="contact-item">
                  <svg class="contact-svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  ${hospAddress}
                </p>
                <p class="contact-item">
                  <svg class="contact-svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  ${hospPhone}
                </p>
                <p class="contact-item">
                  <svg class="contact-svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  ${hospEmail}
                </p>
              </div>
            </div>
            
            <div class="divider"></div>
          </div>
          
          <div class="patient-box">
            <div class="patient-field">
              <span class="info-label">Patient Name</span>
              <span class="info-value">${patName}</span>
            </div>
            <div class="patient-field">
              <span class="info-label">Age / Gender</span>
              <span class="info-value">${patAgeGender}</span>
            </div>
            <div class="patient-field text-right">
              <span class="info-label">Date of Issue</span>
              <span class="info-value">${presDate}</span>
            </div>
            <div class="patient-field text-right">
              <span class="info-label">Patient MRN</span>
              <span class="info-value">${patMRN}</span>
            </div>
          </div>
          
          <div class="rx-container">
            <div class="rx-symbol">Rx</div>
          </div>
          
          <table class="meds-table">
            <thead>
              <tr>
                <th style="width: 44%;">MEDICINE & STRENGTH</th>
                <th style="width: 18%;">DOSAGE</th>
                <th style="width: 22%;">FREQUENCY</th>
                <th style="width: 16%;">DURATION</th>
              </tr>
            </thead>
            <tbody>
              ${medContent}
            </tbody>
          </table>
          
          ${adviceContent}
          
          <div class="footer-section">
            <div class="footer-left">
              <h3 style="font-size: 11px; font-weight: 800; color: #015f91; margin: 0 0 3px 0; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Plus Jakarta Sans', sans-serif;">Digital Health Record</h3>
              <p style="font-size: 10px; color: #64748b; margin: 0; line-height: 1.5; font-weight: 500;">
                This document is a authorized clinical prescription registered under hospital safety guidelines. Valid for 7 days.
              </p>
            </div>
            <div class="footer-right">
              <div class="sig-line"></div>
              <h3 class="doc-name">${docName}</h3>
              <p class="doc-reg">${docReg}</p>
              <p class="doc-spec">${docSpecialty}</p>
            </div>
          </div>
        </div>
        
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => { window.close(); }, 500);
          }
        </script>
      </body>
    </html>
  `;
}
