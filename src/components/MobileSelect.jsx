import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export function MobileSelect({ trigger, value, onValueChange, options, placeholder }) {
  const [open, setOpen] = React.useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-between">
            {selectedOption?.label || placeholder || 'Select...'}
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{placeholder || 'Select option'}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8 pt-4">
          <div className="space-y-2">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                  value === option.value
                    ? 'bg-cyan-500/10 border-cyan-500/50'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <span className={value === option.value ? 'text-cyan-400 font-medium' : 'text-white'}>
                  {option.label}
                </span>
                {value === option.value && <Check className="w-5 h-5 text-cyan-400" />}
              </button>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}