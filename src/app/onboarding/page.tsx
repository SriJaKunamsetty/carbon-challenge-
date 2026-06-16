"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { aggregateMonthlyCarbon } from "@/lib/carbon/calculator";
import { calculateCarbonScore } from "@/lib/carbon/score";
import { TransportMode } from "@/lib/carbon/transport";
import { FoodType } from "@/lib/carbon/food";
import { ApplianceType } from "@/lib/carbon/electricity";
import { AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { logger } from "@/lib/logger";

import { StepPersonal } from "@/components/onboarding/step-personal";
import { StepTransport } from "@/components/onboarding/step-transport";
import { StepDiet } from "@/components/onboarding/step-diet";
import { StepHousehold } from "@/components/onboarding/step-household";
import { StepGoals } from "@/components/onboarding/step-goals";

const LOG_CTX = { module: "OnboardingPage" };

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, onboardUser, loading } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Step 1: Personal
  const [name, setName] = useState("");
  const [age, setAge] = useState(25);
  const [country, setCountry] = useState("United States");
  const [occupation, setOccupation] = useState("Technology");

  // Initialise name from profile on first load; use a ref to avoid re-running.
  const profileNameInitialised = React.useRef(false);
  useEffect(() => {
    if (profile && !profileNameInitialised.current) {
      profileNameInitialised.current = true;
      setName(profile.name || "");
    }
  }, [profile]);

  // Step 2: Transport (monthly km)
  const [carKm, setCarKm] = useState(600);
  const [carType, setCarType] = useState<"gasolineCar" | "electricCar">("gasolineCar");
  const [busKm, setBusKm] = useState(100);
  const [trainKm, setTrainKm] = useState(50);
  const [flightHours, setFlightHours] = useState(2);

  // Step 3: Diet (servings per week)
  const [beefServings, setBeefServings] = useState(3);
  const [poultryServings, setPoultryServings] = useState(4);
  const [dairyServings, setDairyServings] = useState(7);
  const [vegServings, setVegServings] = useState(14);
  const [isLocalOrganic, setIsLocalOrganic] = useState(false);

  // Step 4: Household (daily hours)
  const [acHours, setAcHours] = useState(4);
  const [heaterHours, setHeaterHours] = useState(2);
  const [computerHours, setComputerHours] = useState(6);
  const [renewablePercent, setRenewablePercent] = useState(10);

  // Step 5: Goals & Submit
  const [carbonGoal, setCarbonGoal] = useState(300);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (profile?.onboarded) {
      router.push("/dashboard");
    }
  }, [user, profile, loading, router]);

  const handleNext = () => { if (step < totalSteps) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const transportInput = [
        { mode: carType as TransportMode, distanceKm: carKm },
        { mode: "bus" as TransportMode, distanceKm: busKm },
        { mode: "train" as TransportMode, distanceKm: trainKm },
        { mode: "flightShort" as TransportMode, distanceKm: flightHours * 800 },
      ];
      const foodInput = {
        entries: [
          { type: "beef" as FoodType, servings: beefServings * 4 },
          { type: "poultry" as FoodType, servings: poultryServings * 4 },
          { type: "dairy" as FoodType, servings: dairyServings * 4 },
          { type: "vegetables" as FoodType, servings: vegServings * 4 },
        ],
        isLocalOrOrganic: isLocalOrganic,
      };
      const electricityInput = {
        usage: [
          { type: "airConditioner" as ApplianceType, hours: acHours * 30 },
          { type: "heater" as ApplianceType, hours: heaterHours * 30 },
          { type: "computer" as ApplianceType, hours: computerHours * 30 },
        ],
        renewableRatio: renewablePercent / 100,
      };

      const monthlyCarbon = aggregateMonthlyCarbon({
        transport: transportInput,
        food: foodInput,
        electricity: electricityInput,
        shopping: [{ category: "misc", count: 4 }],
        water: { tapLiters: 3000, bottlesCount: 10 },
        waste: { landfillKg: 20, recycledKg: 10, compostKg: 5 },
      });

      const score = calculateCarbonScore(monthlyCarbon);

      await onboardUser({
        name,
        age: Number(age),
        country,
        occupation,
        goal: Number(carbonGoal),
        carbonScore: score,
        points: 100,
      });
      router.push("/dashboard");
    } catch (error) {
      logger.error(LOG_CTX, "Onboarding submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial blobs */}
      <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[45vw] h-[45vw] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Info */}
      <div className="w-full max-w-lg mb-8 text-center relative z-10">
        <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
          Setup Wizard
        </span>
        <h1 className="text-xl font-bold mt-3 text-white">Let&apos;s Build Your Carbon Twin</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Answer a few quick questions to estimate your carbon index.
        </p>

        {/* Progress Tracker */}
        <div className="flex items-center justify-between mt-6 px-10">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            return (
              <div key={`step-${stepNum}`} className="flex items-center flex-1 last:flex-none">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${
                    (() => {
                      if (isActive) return "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]";
                      if (isCompleted) return "bg-zinc-800 border-zinc-700 text-emerald-400";
                      return "bg-transparent border-zinc-800 text-zinc-600";
                    })()
                  }`}
                >
                  {stepNum}
                </div>
                {idx < totalSteps - 1 && (
                  <div className={`flex-grow h-[1px] mx-2 transition-colors duration-300 ${isCompleted ? "bg-emerald-500/50" : "bg-zinc-800"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <GlassCard className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <StepPersonal name={name} age={age} country={country} occupation={occupation}
                onNameChange={setName} onAgeChange={setAge} onCountryChange={setCountry} onOccupationChange={setOccupation} />
            )}
            {step === 2 && (
              <StepTransport carKm={carKm} carType={carType} busKm={busKm} trainKm={trainKm} flightHours={flightHours}
                onCarKmChange={setCarKm} onCarTypeChange={setCarType} onBusKmChange={setBusKm} onTrainKmChange={setTrainKm} onFlightHoursChange={setFlightHours} />
            )}
            {step === 3 && (
              <StepDiet beefServings={beefServings} poultryServings={poultryServings} dairyServings={dairyServings} vegServings={vegServings} isLocalOrganic={isLocalOrganic}
                onBeefChange={setBeefServings} onPoultryChange={setPoultryServings} onDairyChange={setDairyServings} onVegChange={setVegServings} onLocalOrganicChange={setIsLocalOrganic} />
            )}
            {step === 4 && (
              <StepHousehold acHours={acHours} heaterHours={heaterHours} computerHours={computerHours} renewablePercent={renewablePercent}
                onAcHoursChange={setAcHours} onHeaterHoursChange={setHeaterHours} onComputerHoursChange={setComputerHours} onRenewablePercentChange={setRenewablePercent} />
            )}
            {step === 5 && (
              <StepGoals carbonGoal={carbonGoal} onCarbonGoalChange={setCarbonGoal} />
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/[0.06]">
            {step > 1 ? (
              <button type="button" onClick={handleBack} disabled={isSubmitting}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-2">
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            ) : (<div />)}

            {step < totalSteps ? (
              <Button onClick={handleNext} className="flex items-center gap-1">
                <span>Continue</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={isSubmitting}>
                <span>Initialize Platform</span>
              </Button>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
