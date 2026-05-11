import {
  HeartPulse, Ribbon, Bone, Baby, Smile, Brain, Sparkles, Siren, Stethoscope,
  Scissors, ClipboardCheck, ScanLine, TestTube, X, Users, Pill, Activity,
  HeartHandshake, Ambulance, Microscope,
} from "lucide-react";

// Map icon string from backend to lucide component
export const ICON_MAP = {
  "heart-pulse": HeartPulse,
  ribbon: Ribbon,
  bone: Bone,
  baby: Baby,
  smile: Smile,
  brain: Brain,
  tooth: Smile, // tooth icon proxy
  sparkles: Sparkles,
  siren: Siren,
  stethoscope: Stethoscope,
  scissors: Scissors,
  "clipboard-check": ClipboardCheck,
  scan: ScanLine,
  "test-tube": TestTube,
  x: X,
  users: Users,
  pill: Pill,
  activity: Activity,
  "heart-handshake": HeartHandshake,
  ambulance: Ambulance,
  microscope: Microscope,
};

export function iconFor(name) {
  return ICON_MAP[name] || Stethoscope;
}
