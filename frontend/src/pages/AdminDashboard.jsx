import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { LogOut, Plus, Trash2, Upload, Users2, CalendarCheck, Inbox, RefreshCw, Save, Pencil, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiErrorDetail, HOSPITAL } from "@/lib/api";
import { resolvePhotoUrl } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const PLACEHOLDER = "https://images.unsplash.com/photo-1631558554226-fb65b25aa939?crop=entropy&cs=srgb&fm=jpg&q=85&w=400";

export default function AdminDashboardPage() {
  const { user, loading, logout } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appts, setAppts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [specs, setSpecs] = useState([]);

  const loadAll = useCallback(async () => {
    try {
      const [d, a, c, s] = await Promise.all([
        api.get("/doctors"),
        api.get("/admin/appointments"),
        api.get("/admin/contacts"),
        api.get("/specialities"),
      ]);
      setDoctors(d.data || []);
      setAppts(a.data || []);
      setContacts(c.data || []);
      setSpecs(s.data || []);
    } catch (err) {
      console.error("Failed to load admin data", err);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === "admin") loadAll();
  }, [user, loadAll]);

  if (loading) return <div className="container-narrow py-20 text-center text-foreground/60">Loading…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;

  return (
    <div className="bg-muted/40 min-h-screen" data-testid="admin-dashboard-page">
      <div className="border-b border-border/60 bg-white">
        <div className="container-narrow py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="OrbSky Hospital" className="h-10 w-auto object-contain" />
            <div>
              <div className="font-heading font-bold">Admin Console</div>
              <div className="text-xs text-foreground/55">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadAll} className="border-primary/30 text-primary"><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
            <Button variant="outline" size="sm" asChild className="border-primary/30 text-primary"><Link to="/">View site</Link></Button>
            <Button size="sm" onClick={logout} className="bg-foreground hover:bg-foreground/90 text-white" data-testid="admin-logout-btn"><LogOut className="h-4 w-4 mr-1" /> Sign out</Button>
          </div>
        </div>
      </div>

      <div className="container-narrow py-8">
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Stat icon={Users2} label="Doctors" value={doctors.length} color="text-primary" />
          <Stat icon={CalendarCheck} label="Appointments" value={appts.length} color="text-secondary" />
          <Stat icon={Inbox} label="Contact messages" value={contacts.length} color="text-emergency" />
        </div>

        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="bg-white border border-border/60">
            <TabsTrigger value="appointments" data-testid="tab-appointments">Appointments</TabsTrigger>
            <TabsTrigger value="doctors" data-testid="tab-doctors">Doctors</TabsTrigger>
            <TabsTrigger value="contacts" data-testid="tab-contacts">Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="mt-4">
            <AppointmentsTable items={appts} />
          </TabsContent>

          <TabsContent value="doctors" className="mt-4">
            <DoctorsManager doctors={doctors} specs={specs} reload={loadAll} />
          </TabsContent>

          <TabsContent value="contacts" className="mt-4">
            <ContactsTable items={contacts} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="card-soft p-5 flex items-center gap-4" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className={`h-12 w-12 rounded-xl bg-muted grid place-items-center ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-foreground/55">{label}</div>
        <div className="font-heading font-bold text-2xl">{value}</div>
      </div>
    </div>
  );
}

function AppointmentsTable({ items }) {
  if (!items.length) return <Empty label="No appointments yet." />;
  return (
    <div className="card-soft overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-foreground/65">
          <tr>
            <Th>When</Th><Th>Patient</Th><Th>Phone</Th><Th>Department</Th><Th>Doctor</Th><Th>Reason</Th><Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id} className="border-t border-border/50">
              <Td mono>{a.appointment_date} {a.appointment_time}</Td>
              <Td>{a.patient_name} ({a.patient_age})</Td>
              <Td mono>{a.patient_phone}</Td>
              <Td>{a.department}</Td>
              <Td>{a.doctor_name}</Td>
              <Td><div className="max-w-xs truncate text-foreground/65">{a.reason || "—"}</div></Td>
              <Td><span className="px-2 py-0.5 rounded-full text-xs bg-secondary/15 text-secondary font-semibold">{a.status}</span></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContactsTable({ items }) {
  if (!items.length) return <Empty label="No contact messages yet." />;
  return (
    <div className="card-soft overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-foreground/65">
          <tr><Th>Date</Th><Th>Name</Th><Th>Phone</Th><Th>Email</Th><Th>Dept</Th><Th>Message</Th></tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-t border-border/50">
              <Td mono>{c.created_at.slice(0, 16).replace("T", " ")}</Td>
              <Td>{c.name}</Td>
              <Td mono>{c.phone}</Td>
              <Td>{c.email || "—"}</Td>
              <Td>{c.department || "—"}</Td>
              <Td><div className="max-w-md text-foreground/70">{c.message}</div></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty({ label }) {
  return <div className="card-soft p-10 text-center text-foreground/55">{label}</div>;
}

function Th({ children }) { return <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-semibold">{children}</th>; }
function Td({ children, mono }) { return <td className={`px-4 py-3 align-top ${mono ? 'font-mono' : ''}`}>{children}</td>; }

const BLANK = {
  name: "", designation: "Consultant", department: "Cardiology", experience_years: 0,
  qualifications: "", bio: "", consultation_fee: 500, timings: "Mon-Sat 10:00 AM - 1:00 PM", photo_url: "",
};

function DoctorsManager({ doctors, specs, reload }) {
  const [editing, setEditing] = useState(null); // doctor object or BLANK for new
  const fileRef = useRef();

  const startCreate = () => setEditing({ ...BLANK, department: specs[0]?.name || "Cardiology", _new: true });
  const startEdit = (d) => setEditing({ ...d });
  const cancel = () => setEditing(null);

  const save = async () => {
    try {
      const body = { ...editing };
      delete body._new;
      if (editing._new) {
        const res = await api.post("/admin/doctors", body);
        toast.success("Doctor created");
        setEditing({ ...res.data });
      } else {
        await api.put(`/admin/doctors/${editing.id}`, body);
        toast.success("Doctor updated");
        setEditing(null);
      }
      reload();
    } catch (e) {
      toast.error(formatApiErrorDetail(e?.response?.data?.detail));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this doctor?")) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      toast.success("Doctor deleted");
      reload();
    } catch (e) {
      toast.error(formatApiErrorDetail(e?.response?.data?.detail));
    }
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editing?.id) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post(`/admin/doctors/${editing.id}/photo`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setEditing({ ...editing, photo_url: res.data.photo_url, storage_path: res.data.storage_path });
      toast.success("Photo uploaded");
      reload();
    } catch (err) {
      toast.error(formatApiErrorDetail(err?.response?.data?.detail) || "Upload failed");
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card-soft p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-heading font-semibold">All doctors ({doctors.length})</div>
          <Button size="sm" onClick={startCreate} data-testid="add-doctor-btn"><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {doctors.map((d) => (
            <div key={d.id} className={`p-3 rounded-xl border ${editing?.id === d.id ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"} flex items-center gap-3`}>
              <img src={resolvePhotoUrl(d.photo_url, PLACEHOLDER)} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{d.name}</div>
                <div className="text-xs text-foreground/55 truncate">{d.department} · <span className="font-mono">{d.experience_years} yrs</span></div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => startEdit(d)} data-testid={`edit-doctor-${d.id}`}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(d.id)} className="text-emergency" data-testid={`delete-doctor-${d.id}`}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </div>

      <div className="card-soft p-5">
        {!editing ? (
          <div className="h-full grid place-items-center text-center text-foreground/55 py-16">
            Select a doctor on the left or add a new one.
          </div>
        ) : (
          <div data-testid="doctor-editor">
            <div className="flex items-center justify-between mb-4">
              <div className="font-heading font-semibold">{editing._new ? "Add new doctor" : "Edit doctor"}</div>
              <Button size="icon" variant="ghost" onClick={cancel}><X className="h-4 w-4" /></Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input placeholder="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} data-testid="edit-name" />
              <Input placeholder="Designation" value={editing.designation} onChange={(e) => setEditing({ ...editing, designation: e.target.value })} />
              <Select value={editing.department} onValueChange={(v) => setEditing({ ...editing, department: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">{specs.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" placeholder="Years of experience" value={editing.experience_years} onChange={(e) => setEditing({ ...editing, experience_years: Number(e.target.value) })} />
              <Input className="sm:col-span-2" placeholder="Qualifications" value={editing.qualifications} onChange={(e) => setEditing({ ...editing, qualifications: e.target.value })} />
              <Input placeholder="Timings" value={editing.timings} onChange={(e) => setEditing({ ...editing, timings: e.target.value })} />
              <Input type="number" placeholder="Consultation fee" value={editing.consultation_fee} onChange={(e) => setEditing({ ...editing, consultation_fee: Number(e.target.value) })} />
              <Textarea className="sm:col-span-2 min-h-24" placeholder="Bio" value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <img src={resolvePhotoUrl(editing.photo_url, PLACEHOLDER)} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <input type="file" ref={fileRef} className="hidden" accept="image/png,image/jpeg,image/webp" onChange={upload} />
              <Button variant="outline" size="sm" className="border-primary/30 text-primary" disabled={!editing.id} onClick={() => fileRef.current?.click()} data-testid="upload-photo-btn">
                <Upload className="h-4 w-4 mr-1" /> {editing.id ? "Upload photo" : "Save doctor first to upload"}
              </Button>
            </div>

            <div className="mt-5 flex gap-2">
              <Button onClick={save} data-testid="save-doctor-btn"><Save className="h-4 w-4 mr-1" /> {editing._new ? "Create" : "Save"}</Button>
              <Button variant="outline" onClick={cancel} className="border-primary/30 text-primary">Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
