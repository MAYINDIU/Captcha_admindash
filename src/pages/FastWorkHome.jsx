import React from "react";
import { FiCheckCircle, FiClock, FiDownload, FiMessageCircle, FiShield, FiSmartphone } from "react-icons/fi";
import FastWorkBrand from "../components/FastWorkBrand";

const appDownloadUrl = "/downloads/captcha.apk";

const steps = [
  "অ্যাপ ডাউনলোড করে অ্যাকাউন্টে লগইন করুন",
  "দৈনিক কাজ/ক্যাপচা টাস্ক সম্পন্ন করুন",
  "ওয়ালেট ব্যালেন্স, কমিশন ও পেমেন্ট হিস্ট্রি দেখুন",
  "প্রয়োজনে সাপোর্ট চ্যাটে মেসেজ পাঠান",
];

const features = [
  {
    icon: FiSmartphone,
    title: "মোবাইল অ্যাপ",
    text: "ব্যবহারকারীরা অ্যাপ থেকে নিজের কাজ, ব্যালেন্স ও আপডেট দেখতে পারবেন।",
  },
  {
    icon: FiClock,
    title: "২৪/৭ অ্যাক্সেস",
    text: "যেকোনো সময় অ্যাকাউন্টে ঢুকে কাজের অবস্থা যাচাই করা যাবে।",
  },
  {
    icon: FiShield,
    title: "ভেরিফিকেশন",
    text: "প্রোফাইল, নিরাপত্তা ও প্রয়োজনীয় তথ্য যাচাই করা সহজ হবে।",
  },
  {
    icon: FiMessageCircle,
    title: "সাপোর্ট চ্যাট",
    text: "সমস্যা হলে সরাসরি সাপোর্ট টিমের কাছে মেসেজ পাঠানো যাবে।",
  },
];

const FastWorkHome = () => {
  return (
    <div className="min-h-screen bg-emerald-50 text-emerald-950">
      <header className="border-b border-emerald-800 bg-emerald-700 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <FastWorkBrand light />
          <a
            href={appDownloadUrl}
            download
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-300 px-4 text-sm font-black text-emerald-950 transition hover:bg-amber-200"
          >
            <FiDownload className="h-4 w-4" />
            অ্যাপ ডাউনলোড
          </a>
        </div>
      </header>

      <main>
        <section className="bg-emerald-700 text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-[1fr_0.82fr] lg:py-20">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/15 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">
                FastWork24 User App
              </div>
              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">
                কাজ, ব্যালেন্স ও সাপোর্ট এখন এক অ্যাপে
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50">
                প্রিয় গ্রাহক,
                আপনি কি অনলাইনে পার্ট-টাইম কাজ করে আয় করতে আগ্রহী?

                তাহলে এখনই আমাদের অ্যাপটি ডাউনলোড করে একটি একাউন্ট তৈরি করুন। 
                এরপর আপনার ইউজারনেম ও পাসওয়ার্ড দিয়ে লগইন করে সাপোর্ট টিমে মেসেজ দিন।
                আমাদের সাপোর্ট টিম আপনাকে কাজের সম্পূর্ণ নির্দেশনা বুঝিয়ে দেবে।
                ধন্যবাদ।
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {/* <a
                  href={appDownloadUrl}
                  download
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-amber-300 px-6 text-sm font-black uppercase tracking-[0.12em] text-emerald-950 transition hover:bg-amber-200"
                >
                  <FiDownload className="h-5 w-5" />
                  Android App
                </a> */}
                <a
                  href="#how-it-works"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-white/35 px-6 text-sm font-black text-white transition hover:border-amber-200 hover:bg-white/10"
                >
                  কীভাবে কাজ করবে
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm">
              <div className="rounded-lg border border-emerald-500 bg-emerald-950 p-4 shadow-xl">
                <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-emerald-700"></div>
                <div className="rounded-lg bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <FastWorkBrand compact />
                    <span className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">Active</span>
                  </div>
                  <div className="rounded-lg bg-emerald-800 p-4 text-white">
                    <div className="text-xs font-bold text-emerald-100">Wallet Balance</div>
                    <div className="mt-2 text-3xl font-black">৳345.10</div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-amber-50 p-3">
                      <div className="text-xs font-bold text-amber-700">Today</div>
                      <div className="mt-1 text-xl font-black">128</div>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <div className="text-xs font-bold text-emerald-700">Paid</div>
                      <div className="mt-1 text-xl font-black">৳2,450</div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {["Captcha task completed", "Withdrawal request pending", "Support replied"].map((item) => (
                      <div key={item} className="flex items-center gap-2 rounded-lg border border-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800">
                        <FiCheckCircle className="h-4 w-4 text-emerald-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* <section id="download" className="border-y border-amber-400 bg-amber-300 text-emerald-950">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-5 py-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black tracking-normal">FastWork24 অ্যাপ ডাউনলোড করুন</h2>
              <p className="mt-2 text-sm text-emerald-800">Android মোবাইল থেকে সরাসরি অ্যাপ ইনস্টল করা যাবে।</p>
            </div>
            <a
              href={appDownloadUrl}
              download
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-800 px-6 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-emerald-700"
            >
              <FiDownload className="h-5 w-5" />
              Download APK
            </a>
          </div>
        </section> */}

        <section className="mx-auto max-w-6xl px-5 py-14">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-black tracking-normal">ব্যবহারকারীরা কী করতে পারবেন</h2>
            <p className="mt-3 text-sm leading-7 text-emerald-800">
              FastWork24 অ্যাপ ব্যবহারকারীর দৈনন্দিন কাজ, আয় এবং সাপোর্ট ব্যবস্থাপনাকে সহজ করে।
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black tracking-normal">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-emerald-800">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-teal-50">
          <div className="mx-auto max-w-6xl px-5 py-14">
            <h2 className="text-3xl font-black tracking-normal">কাজ করার ধাপ</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-lg border border-emerald-100 bg-white p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm font-bold leading-6 text-emerald-900">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-emerald-800 bg-emerald-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-sm text-emerald-100 sm:flex-row sm:items-center sm:justify-between">
          <FastWorkBrand light />
          <div>fastwork24.com</div>
        </div>
      </footer>
    </div>
  );
};

export default FastWorkHome;
