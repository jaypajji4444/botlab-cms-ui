import React, { useEffect, useState } from "react";
import { pagesApi } from "../client/pages";
import { sectionsApi } from "../client/sections";
import { blogsApi } from "../client/blogs";
import { portfoliosApi } from "../client/portfolios";
import { careersApi } from "../client/careers";
import { contactsApi } from "../client/contacts";
import { caseStudiesApi } from "../client/caseStudies";
import { reportsApi } from "../client/reports";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Briefcase,
  FileText,
  FolderOpen,
  Layers,
  Mail,
  Newspaper,
  PieChart,
} from "lucide-react";
import { Link } from "react-router-dom";

interface StatCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  link: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  count,
  icon,
  bgColor,
  textColor,
  link,
}) => (
  <Link
    to={link}
    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md hover:border-gray-200 transition-all group"
  >
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{count}</p>
    </div>
    <div
      className={`h-12 w-12 ${bgColor} rounded-full flex items-center justify-center ${textColor} group-hover:scale-110 transition-transform`}
    >
      {icon}
    </div>
  </Link>
);

interface QuickActionProps {
  to: string;
  title: string;
  description: string;
  hoverBorder: string;
  hoverBg: string;
  hoverText: string;
  iconColor: string;
}

const QuickAction: React.FC<QuickActionProps> = ({
  to,
  title,
  description,
  hoverBorder,
  hoverBg,
  hoverText,
  iconColor,
}) => (
  <Link
    to={to}
    className={`group p-4 rounded-lg border border-gray-200 ${hoverBorder} ${hoverBg} transition-all flex items-center justify-between`}
  >
    <div>
      <h3 className={`font-medium text-gray-900 ${hoverText}`}>{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
    <ArrowRight
      size={20}
      className={`text-gray-400 ${iconColor}`}
    />
  </Link>
);

interface DashboardStats {
  pages: number;
  sections: number;
  blogs: number;
  portfolios: number;
  jobs: number;
  contacts: number;
  caseStudies: number;
  reports: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    pages: 0,
    sections: 0,
    blogs: 0,
    portfolios: 0,
    jobs: 0,
    contacts: 0,
    caseStudies: 0,
    reports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      pagesApi.getAll(),
      sectionsApi.getAll(),
      blogsApi.getAll(),
      portfoliosApi.getAll(),
      careersApi.getAllJobs(),
      contactsApi.getAll(),
      caseStudiesApi.getAllAdmin(),
      reportsApi.getAll(),
    ])
      .then(
        ([
          pages,
          sections,
          blogs,
          portfolios,
          jobs,
          contacts,
          caseStudies,
          reports,
        ]) => {
          setStats({
            pages: pages.length,
            sections: sections.length,
            blogs: blogs.length,
            portfolios: portfolios.length,
            jobs: jobs.length,
            contacts: contacts.length,
            caseStudies: caseStudies.length,
            reports: reports.length,
          });
          setError(null);
        },
      )
      .catch((err) => {
        console.error(err);
        setError(
          "Could not connect to the CMS API. Ensure the backend is running and you are logged in.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards: StatCardProps[] = [
    {
      label: "Pages",
      count: stats.pages,
      icon: <FileText size={24} />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      link: "/pages",
    },
    {
      label: "Sections",
      count: stats.sections,
      icon: <Layers size={24} />,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      link: "/sections",
    },
    {
      label: "Blogs",
      count: stats.blogs,
      icon: <Newspaper size={24} />,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      link: "/blogs",
    },
    {
      label: "Portfolios",
      count: stats.portfolios,
      icon: <FolderOpen size={24} />,
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      link: "/portfolios",
    },
    {
      label: "Careers",
      count: stats.jobs,
      icon: <Briefcase size={24} />,
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600",
      link: "/careers",
    },
    {
      label: "Case Studies",
      count: stats.caseStudies,
      icon: <BookOpen size={24} />,
      bgColor: "bg-rose-50",
      textColor: "text-rose-600",
      link: "/case-studies",
    },
    {
      label: "Reports",
      count: stats.reports,
      icon: <PieChart size={24} />,
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      link: "/reports",
    },
    {
      label: "Contacts",
      count: stats.contacts,
      icon: <Mail size={24} />,
      bgColor: "bg-pink-50",
      textColor: "text-pink-600",
      link: "/contacts",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back. Here is what is happening with your content.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2">
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            to="/pages/create"
            title="Create New Page"
            description="Compose a new landing page with existing sections."
            hoverBorder="hover:border-blue-300"
            hoverBg="hover:bg-blue-50"
            hoverText="group-hover:text-blue-700"
            iconColor="group-hover:text-blue-600"
          />
          <QuickAction
            to="/sections/create"
            title="Create New Section"
            description="Build a reusable component block."
            hoverBorder="hover:border-purple-300"
            hoverBg="hover:bg-purple-50"
            hoverText="group-hover:text-purple-700"
            iconColor="group-hover:text-purple-600"
          />
          <QuickAction
            to="/blogs/create"
            title="Write New Blog"
            description="Draft a new blog post."
            hoverBorder="hover:border-emerald-300"
            hoverBg="hover:bg-emerald-50"
            hoverText="group-hover:text-emerald-700"
            iconColor="group-hover:text-emerald-600"
          />
          <QuickAction
            to="/portfolios/create"
            title="Add Portfolio"
            description="Showcase a new project."
            hoverBorder="hover:border-amber-300"
            hoverBg="hover:bg-amber-50"
            hoverText="group-hover:text-amber-700"
            iconColor="group-hover:text-amber-600"
          />
          <QuickAction
            to="/careers/create"
            title="Post a Job"
            description="Create a new job listing."
            hoverBorder="hover:border-cyan-300"
            hoverBg="hover:bg-cyan-50"
            hoverText="group-hover:text-cyan-700"
            iconColor="group-hover:text-cyan-600"
          />
          <QuickAction
            to="/case-studies/create"
            title="Add Case Study"
            description="Document a new client success story."
            hoverBorder="hover:border-rose-300"
            hoverBg="hover:bg-rose-50"
            hoverText="group-hover:text-rose-700"
            iconColor="group-hover:text-rose-600"
          />
        </div>
      </div>
    </div>
  );
};
