"use client"

import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Trash2, Plus, Check, X } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "sonner"
import { AddUserModal, type UserFormData } from "@/components/add-user-modal"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"

interface User {
  id: number
  name: string
  email: string
  role: "admin" | "user"
  status: "aktif" | "inaktif"
  joinDate: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editData, setEditData] = useState<User | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Ambil data pengguna dari API
  const fetchUsers = async () => {
  try {
    const res = await axios.get("/api/users", {
      withCredentials: true, // 🔐 WAJIB
    });
    setUsers(res.data);
  } catch (err) {
    console.error(err);
    toast.error("Gagal mengambil data pengguna");
  }
};

  useEffect(() => {
    fetchUsers()
  }, [])

  // Tambah pengguna
  const handleAddUser = async (data: UserFormData) => {
  try {
    const res = await axios.post(
      "/api/users",
      data,
      { withCredentials: true } // 🔐 WAJIB
    );

    setUsers(prev => [...prev, res.data.data]);
    setAddModalOpen(false);
    toast.success("Pengguna berhasil ditambahkan");
  } catch (err) {
    console.error(err);
    toast.error("Gagal menambahkan pengguna");
  }
};

  // Update pengguna
  const handleUpdateUser = async (id: number, data: UserFormData) => {
  try {
    const res = await axios.put(
      "/api/users",
      { id, ...data },
      { withCredentials: true } // 🔐 WAJIB
    );

    const updated = res.data.data;
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, ...updated } : u))
    );

    toast.success("Pengguna berhasil diupdate");
  } catch (err) {
    console.error(err);
    toast.error("Gagal update pengguna");
  }
};


  // Hapus pengguna
  const handleDeleteUser = async (id: number) => {
  try {
    await axios.delete(`/api/users?id=${id}`, {
      withCredentials: true, // 🔐 WAJIB
    });

    setUsers(prev => prev.filter(u => u.id !== id));
    setDeleteModalOpen(false);
    setSelectedId(null);
    toast.success("Pengguna berhasil dihapus");
  } catch (err) {
    console.error(err);
    toast.error("Gagal menghapus pengguna");
  }
};

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-8 px-6">
          {/* Page Title */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Kelola Pengguna</h1>
                <p className="text-foreground/60 mt-2">Manajemen pengguna dan hak akses sistem</p>
              </div>
              <Button className="gap-2" onClick={() => setAddModalOpen(true)}>
                <Plus size={20} />
                Tambah Pengguna
              </Button>
            </div>
          </motion.div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <p className="text-sm text-foreground/60 mb-1">Total Pengguna</p>
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-foreground/60 mb-1">Pengguna Aktif</p>
              <p className="text-2xl font-bold text-green-600">{users.filter((u) => u.status === "aktif").length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-foreground/60 mb-1">Admin</p>
              <p className="text-2xl font-bold text-blue-600">{users.filter((u) => u.role === "admin").length}</p>
            </Card>
          </div>

          {/* Users Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold">Nama Pengguna</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Bergabung</TableHead>
                      <TableHead className="font-semibold text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-foreground/70">{user.email}</TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {user.role === "admin" ? "Admin" : "User"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.status === "aktif" ? (
                              <>
                                <Check size={16} className="text-green-600" />
                                <span className="text-sm text-green-600">Aktif</span>
                              </>
                            ) : (
                              <>
                                <X size={16} className="text-sm text-red-600" />
                                <span className="text-sm text-red-600">Tidak Aktif</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground/70 text-sm">{user.joinDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/70 hover:text-foreground"
                              onClick={() => {
                                setEditData(user)
                                setEditModalOpen(true)
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors text-red-600 dark:text-red-400"
                              onClick={() => {
                                setSelectedId(user.id)
                                setDeleteModalOpen(true)
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </motion.div>

          {/* Modals */}


          {/* Modal Tambah */}
<AddUserModal
  open={addModalOpen}
  onOpenChange={setAddModalOpen}
  onSubmit={(data) => {
    handleAddUser(data)
    setAddModalOpen(false)
  }}
/>

{/* Modal Edit */}
{editData && (
  <AddUserModal
    open={editModalOpen}
    onOpenChange={(open) => {
      if (!open) setEditModalOpen(false)
    }}
    onSubmit={(data) => {
      handleUpdateUser(editData.id, data)
      setEditData(null)
      setEditModalOpen(false)
    }}
    defaultValues={editData}
  />
)}

          <DeleteConfirmationModal
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            title="Hapus Pengguna"
            description="Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan."
            onConfirm={() => selectedId && handleDeleteUser(selectedId)}
          />
        </main>
      </div>
    </div>
  )
}
