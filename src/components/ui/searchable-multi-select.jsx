"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const SearchableMultiSelect = React.forwardRef(({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search options...",
  emptyMessage = "No options found.",
  maxDisplay = 3,
  className,
  ...props
}, ref) => {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const handleSelect = (option) => {
    const newValue = value.includes(option)
      ? value.filter((item) => item !== option)
      : [...value, option];
    onChange?.(newValue);
  };

  const handleRemove = (option) => {
    onChange?.(value.filter((item) => item !== option));
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchValue.toLowerCase())
  );

  const displayValue = value.length > 0
    ? `${value.length} selected`
    : placeholder;

  const visibleValues = value.slice(0, maxDisplay);
  const remainingCount = value.length - maxDisplay;

  return (
    <div className={cn("w-full", className)} ref={ref} {...props}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-10 h-auto"
          >
            <div className="flex flex-wrap gap-1 items-center flex-1">
              {visibleValues.length > 0 ? (
                <>
                  {visibleValues.map((item) => (
                    <Badge key={item} variant="secondary" className="text-xs px-2 py-0.5 h-6">
                      {item}
                      <span
                        className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5 cursor-pointer inline-flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </Badge>
                  ))}
                  {remainingCount > 0 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5 h-6">
                      +{remainingCount} more
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground text-sm">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        {/* ✅ PopoverContent with Portal to escape scroll/clipping */}
        <PopoverContent
          className="w-full p-0"
          align="start"
          side="bottom"
          sideOffset={4}        // space between trigger and dropdown
        >
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(option)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(option) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

    </div>
  );
});

SearchableMultiSelect.displayName = "SearchableMultiSelect";

export { SearchableMultiSelect };
