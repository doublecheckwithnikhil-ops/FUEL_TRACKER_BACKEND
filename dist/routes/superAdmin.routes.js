"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const role_1 = require("../middleware/role");
const auth_1 = require("../middleware/auth");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// GET /api/superadmin/users?search=&page=&pageSize=
router.get("/users", auth_1.authMiddleware, (0, role_1.roleMiddleware)(["super_admin"]), async (req, res, next) => {
    try {
        const search = String(req.query.search ?? "").trim();
        const page = Math.max(Number(req.query.page ?? 1), 1);
        const pageSize = Math.min(Math.max(Number(req.query.pageSize ?? 20), 1), 100);
        const where = search
            ? {
                OR: [
                    { name: { contains: search } },
                    { empCode: { contains: search } },
                    { storeCode: { contains: search } },
                ],
            }
            : {};
        const [items, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: { id: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: {
                    id: true,
                    name: true,
                    empCode: true,
                    storeCode: true,
                    role: { select: { name: true } },
                },
            }),
            prisma.user.count({ where }),
        ]);
        res.json({ items, total, page, pageSize });
    }
    catch (e) {
        next(e);
    }
});
// POST /api/superadmin/users/:id/grant-admin
router.post("/users/:id/grant-admin", auth_1.authMiddleware, (0, role_1.roleMiddleware)(["super_admin"]), async (req, res, next) => {
    try {
        const userId = Number(req.params.id);
        if (!userId)
            return res.status(400).json({ message: "Invalid user id" });
        const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });
        if (!adminRole)
            return res.status(500).json({ message: "ADMIN role missing" });
        const user = await prisma.user.update({
            where: { id: userId },
            data: { roleId: adminRole.id },
            select: { id: true, name: true, role: { select: { name: true } } },
        });
        res.json({ user });
    }
    catch (e) {
        next(e);
    }
});
// POST /api/superadmin/users/:id/revoke-admin
router.post("/users/:id/revoke-admin", auth_1.authMiddleware, (0, role_1.roleMiddleware)(["super_admin"]), async (req, res, next) => {
    try {
        const userId = Number(req.params.id);
        if (!userId)
            return res.status(400).json({ message: "Invalid user id" });
        const DEFAULT_FALLBACK_ROLE = "driver";
        const fallbackRole = await prisma.role.findUnique({
            where: { name: DEFAULT_FALLBACK_ROLE },
        });
        if (!fallbackRole)
            return res.status(500).json({ message: `${DEFAULT_FALLBACK_ROLE} role missing` });
        const user = await prisma.user.update({
            where: { id: userId },
            data: { roleId: fallbackRole.id },
            select: { id: true, name: true, role: { select: { name: true } } },
        });
        res.json({ user });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=superAdmin.routes.js.map