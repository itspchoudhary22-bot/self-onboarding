import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import Draft from '@/models/Draft';
import Counter from '@/models/Counter';
import { sendSubmissionConfirmation, sendSalesNewApplication } from '@/lib/email';

export async function POST(request) {
  let _step = 'init';
  try {
    _step = 'parse';
    const body = await request.json();
    const { email, type, country, services, sessionId } = body;

    if (!email || !type || !country || !services || services.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    _step = 'connectDB';
    await connectDB();

    _step = 'counter';
    const year = new Date().getFullYear();
    const counterDoc = await Counter.findOneAndUpdate(
      { name: 'application_counter' },
      { $inc: { value: 1 } },
      { upsert: true, new: true }
    );
    const applicationId = `BC-${year}-${String(counterDoc.value).padStart(4, '0')}`;

    _step = 'create';
    const application = await Application.create({
      email, type, country, sessionId: sessionId || '',
      applicationId, status: 'pending_review',
      // Individual
      individualName: body.individualName || '',
      nationalIdNumber: body.nationalIdNumber || '',
      idProofName: body.idProofName || '',
      idProofBase64: body.idProofBase64 || '',
      contactNumber: body.contactNumber || '',
      registeredAddress: body.registeredAddress || '',
      pincode: body.pincode || '',
      mailingAddress: body.mailingAddress || '',
      officialEmail: body.officialEmail || '',
      designation: body.designation || '',
      workDescription: body.workDescription || '',
      socialMediaHandles: body.socialMediaHandles || '',
      // Company
      companyName: body.companyName || '',
      companyRegNumber: body.companyRegNumber || '',
      regCertName: body.regCertName || '',
      regCertBase64: body.regCertBase64 || '',
      gstin: body.gstin || '',
      companyContact: body.companyContact || '',
      companyRegisteredAddress: body.companyRegisteredAddress || '',
      companyPincode: body.companyPincode || '',
      companyMailingAddress: body.companyMailingAddress || '',
      companyDescription: body.companyDescription || '',
      companyOfficialEmail: body.companyOfficialEmail || '',
      signatoryName: body.signatoryName || '',
      signatoryDesignation: body.signatoryDesignation || '',
      signatoryEmail: body.signatoryEmail || '',
      companySocialMedia: body.companySocialMedia || '',
      copyrightCertName: body.copyrightCertName || '',
      copyrightCertBase64: body.copyrightCertBase64 || '',
      // Services
      services: body.services || [],
      serviceDetails: body.serviceDetails || {},
    });

    if (sessionId) {
      await Draft.findOneAndUpdate({ sessionId }, { status: 'submitted' }).catch(() => {});
    }

    // Fire emails — fully isolated so any failure never blocks or errors the response
    setTimeout(() => {
      try { sendSubmissionConfirmation(body).catch((e) => console.error('Email 1:', e)); } catch (e) { console.error('Email 1 init:', e); }
      try { sendSalesNewApplication(application).catch((e) => console.error('Email 2:', e)); } catch (e) { console.error('Email 2 init:', e); }
    }, 0);

    return NextResponse.json(
      { message: 'Application submitted successfully', id: application._id, applicationId: application.applicationId, sessionId: application.sessionId },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'An application with this email already exists.' }, { status: 409 });
    }
    const detail = error?.errors
      ? Object.values(error.errors).map((e) => e.message).join(', ')
      : (error?.message || String(error));
    console.error(`Submit error at [${_step}]:`, error);
    return NextResponse.json({ error: `[${_step}] ${detail}` }, { status: 500 });
  }
}

