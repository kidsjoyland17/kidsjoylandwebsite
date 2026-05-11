import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

/**
 * useStudents
 *
 * Fetches a paginated, filterable list of students from the admin API.
 *
 * @param {object} params
 * @param {number}  params.page       - Current page (1-based)
 * @param {number}  params.limit      - Results per page
 * @param {string}  params.cls        - Class filter (e.g. "5")
 * @param {string}  params.section    - Section filter ("A" | "B" | "C" | "D" | "")
 * @param {string}  params.search     - Name / parent-name search string
 */
export function useStudents({ page = 1, limit = 20, cls = "", section = "", search = "" } = {}) {
  const [students,   setStudents]   = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit };
      if (cls)     params.class   = cls;
      if (section) params.section = section;
      if (search)  params.search  = search;

      const { data } = await api.get("/admin/students", { params });

      // Support both paginated { students, totalCount, totalPages } shape
      // and legacy flat-array responses so the hook works during migration.
      if (data.data?.students) {
        // New shape: { data: { students, totalCount, totalPages, page } }
        setStudents(data.data.students);
        setTotalCount(data.data.totalCount ?? 0);
        setTotalPages(data.data.totalPages ?? 1);
      } else if (Array.isArray(data.data)) {
        // Legacy shape: { data: [...] }
        setStudents(data.data);
        const total = data.total ?? data.data.length;
        setTotalCount(total);
        setTotalPages(Math.ceil(total / limit));
      } else {
        setStudents([]);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, cls, section, search]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const createStudent = async (payload) => {
    const { data } = await api.post("/admin/students", payload);
    await fetchStudents();
    return data.data;
  };

  const updateStudent = async (id, payload) => {
    const { data } = await api.put(`/admin/students/${id}`, payload);
    setStudents((prev) => prev.map((s) => (s._id === id ? data.data : s)));
    return data.data;
  };

  const deleteStudent = async (id) => {
    await api.delete(`/admin/students/${id}`);
    await fetchStudents();
  };

  return {
    students,
    totalCount,
    totalPages,
    loading,
    error,
    refetch: fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  };
}