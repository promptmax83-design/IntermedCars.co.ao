'use client';

interface Step {
  label: string;
  done: boolean;
  current?: boolean;
}

export default function StepIndicator({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step.done
                ? 'bg-green-500 text-white'
                : step.current
                ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step.done ? '✓' : i + 1}
          </div>
          <span
            className={`text-sm hidden sm:inline ${
              step.done || step.current ? 'text-gray-900 font-medium' : 'text-gray-400'
            }`}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 ${
                step.done ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
