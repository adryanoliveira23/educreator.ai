import {
  collection,
  CollectionReference,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

// Collection Names
export const COLLECTIONS = {
  EXPENSES: "expenses",
  REVENUE: "revenue",
  GOALS: "goals",
  EMPLOYEES: "employees",
  SERVICES: "services",
  CLIENTS: "clients",
  APPOINTMENTS: "appointments",
};

// Typed Helpers (Generic for now, can be strictly typed later)
export const getExpensesCollection = () => collection(db, COLLECTIONS.EXPENSES);
export const getRevenueCollection = () => collection(db, COLLECTIONS.REVENUE);
export const getGoalsCollection = () => collection(db, COLLECTIONS.GOALS);
export const getEmployeesCollection = () =>
  collection(db, COLLECTIONS.EMPLOYEES);
export const getServicesCollection = () => collection(db, COLLECTIONS.SERVICES);
export const getClientsCollection = () => collection(db, COLLECTIONS.CLIENTS);
export const getAppointmentsCollection = () =>
  collection(db, COLLECTIONS.APPOINTMENTS);
