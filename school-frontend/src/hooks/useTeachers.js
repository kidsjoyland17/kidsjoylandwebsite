import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export function useTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/teachers");
      setTeachers(data.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load teachers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  const createTeacher = async (payload) => {
    const { data } = await api.post("/admin/teachers", payload);
    setTeachers((prev) => [data.data, ...prev]);
    return data.data;
  };

  const updateTeacher = async (id, payload) => {
    const { data } = await api.put(`/admin/teachers/${id}`, payload);
    setTeachers((prev) => prev.map((t) => (t._id === id ? data.data : t)));
    return data.data;
  };

  const deleteTeacher = async (id) => {
    await api.delete(`/admin/teachers/${id}`);
    setTeachers((prev) => prev.filter((t) => t._id !== id));
  };

  return { teachers, loading, error, refetch: fetchTeachers, createTeacher, updateTeacher, deleteTeacher };
}