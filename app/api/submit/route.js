import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import Draft from '@/models/Draft';
import Counter from '@/models/Counter';
import { sendSubmissionConfirmation, sendSalesNewApplication } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, type, country, services, sessionId } = body;

    if (!email || !type || !country || !services || services.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const counterValue = await Counter.nextValue('application_counter');
    const year = new Date().getFullYear();
    const applicationId = `BC-${year}-${String(counterValue).padStart(4, '0')}`;

    // Only pass schema-known fields — avoid spreading unknown keys
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
      await Draft.findOneAndUpdate({ sessionId }, { status: 'submitted' });
    }

    Promise.all([
      sendSubmissionConfirmation(body),
      sendSalesNewApplication(application),
    ]).catch((err) => console.error('Email send error:', err));

    return NextResponse.json(
      { message: 'Application submitted successfully', id: application._id, applicationId: application.applicationId, sessionId: application.sessionId },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'An application with this email already exists.' }, { status: 409 });
    }
    const detail = error?.errors
      ? Object.values(error.errors).map(e => e.message).join(', ')
      : (error?.message || String(error));
    console.error('Submit error:', error);
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}

