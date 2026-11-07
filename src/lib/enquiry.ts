/**
 * Enquiry validation shared by the form (instant feedback) and the API route
 * (the real check, because anyone can skip the browser and post directly).
 */
import { budgetOptions, serviceOptions } from "./site";

export type Enquiry = {
  name: string;
  business: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  budget: string;
};

export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d\s-]{7,20}$/;

export function validateEnquiry(d: Enquiry): EnquiryErrors {
  const e: EnquiryErrors = {};
  if (d.name.trim().length < 2) e.name = "Please enter your full name.";
  if (d.name.length > 100) e.name = "That name is a bit long.";
  if (d.business.length > 120) e.business = "That business name is a bit long.";
  if (!EMAIL.test(d.email.trim())) e.email = "Please enter a valid email address.";
  if (d.phone.trim() && !PHONE.test(d.phone.trim())) e.phone = "Please enter a valid phone number.";
  if (!serviceOptions.includes(d.service)) e.service = "Please choose a service.";
  if (d.message.trim().length < 20) e.message = "Tell us a little more (at least 20 characters).";
  if (d.message.length > 5000) e.message = "Please keep it under 5,000 characters.";
  if (d.budget && !budgetOptions.includes(d.budget)) e.budget = "Please choose a budget from the list.";
  return e;
}
