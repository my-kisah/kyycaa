import { ActivityStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getLandingActivities() {
  return prisma.activity.findMany({
    where: { status: ActivityStatus.ACTIVE },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 3,
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
}

export async function getVisibleActivities(params?: {
  search?: string;
  category?: string;
  month?: string;
}) {
  const where: Prisma.ActivityWhereInput = {
    status: ActivityStatus.ACTIVE,
  };

  if (params?.search) {
    where.OR = [
      { title: { contains: params.search } },
      { excerpt: { contains: params.search } },
      { category: { contains: params.search } },
      { tags: { contains: params.search.toLowerCase() } },
    ];
  }

  if (params?.category && params.category !== "all") {
    where.category = params.category;
  }

  if (params?.month && params.month !== "all") {
    const [year, month] = params.month.split("-");
    if (year && month) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      where.date = { gte: start, lt: end };
    }
  }

  return prisma.activity.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export async function getActivityBySlug(slug: string, includeHidden = false) {
  return prisma.activity.findFirst({
    where: {
      slug,
      ...(includeHidden ? {} : { status: ActivityStatus.ACTIVE }),
    },
    include: {
      comments: {
        where: {
          parentId: null,
        },
        orderBy: { createdAt: "desc" },
        include: {
          reactions: {
            select: {
              id: true,
              emoji: true,
              userId: true,
            },
          },
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              reactions: {
                select: {
                  id: true,
                  emoji: true,
                  userId: true,
                },
              },
            },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getAdminOverview() {
  const [totalUsers, totalComments, stats, latestActivities, latestComments, popularViews, popularComments] =
    await Promise.all([
      prisma.user.count({ where: { role: Role.USER } }),
      prisma.comment.count(),
      prisma.activity.aggregate({
        _count: true,
        _sum: { views: true, commentsCount: true },
      }),
      prisma.activity.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.comment.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          content: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      prisma.activity.findMany({
        orderBy: [{ views: "desc" }, { commentsCount: "desc" }],
        take: 6,
        select: {
          id: true,
          title: true,
          views: true,
          commentsCount: true,
        },
      }),
      prisma.activity.findMany({
        orderBy: [{ commentsCount: "desc" }, { views: "desc" }],
        take: 6,
        select: {
          id: true,
          title: true,
          views: true,
          commentsCount: true,
        },
      }),
    ]);

  const totalActivities = stats._count;
  const totalViews = stats._sum.views ?? 0;

  const [activeActivities, hiddenActivities] = await Promise.all([
    prisma.activity.count({ where: { status: ActivityStatus.ACTIVE } }),
    prisma.activity.count({ where: { status: ActivityStatus.HIDDEN } }),
  ]);

  return {
    totalUsers,
    totalComments,
    totalActivities,
    totalViews,
    activeActivities,
    hiddenActivities,
    latestActivities,
    latestComments,
    popularViews,
    popularComments,
  };
}

export async function getAdminActivityList(status?: "all" | "ACTIVE" | "HIDDEN") {
  return prisma.activity.findMany({
    where: status && status !== "all" ? { status } : undefined,
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function getAdminAnalytics() {
  const activities = await prisma.activity.findMany({
    orderBy: [{ views: "desc" }, { commentsCount: "desc" }],
    select: {
      id: true,
      title: true,
      views: true,
      commentsCount: true,
      status: true,
      category: true,
    },
  });

  const ranking = activities.map((item, index) => ({
    ...item,
    rank: index + 1,
    engagementScore: item.views + item.commentsCount * 5,
  }));

  return {
    activities,
    topViewed: [...ranking].sort((a, b) => b.views - a.views).slice(0, 5),
    topCommented: [...ranking].sort((a, b) => b.commentsCount - a.commentsCount).slice(0, 5),
    highestEngagement: [...ranking]
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5),
  };
}

export async function getCommentAdminList(contentId?: string) {
  return prisma.comment.findMany({
    where: {
      ...(contentId && contentId !== "all" ? { contentId } : {}),
      parentId: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      content: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      replies: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
