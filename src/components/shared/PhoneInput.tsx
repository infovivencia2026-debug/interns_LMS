import { useEffect, useMemo, useState } from "react";

/**
 * Country code + phone number field.
 *
 * The value it reads and emits is ONE string, "+<dial> <number>" (e.g.
 * "+91 98765 43210"), so existing forms keep submitting a single `phone` field
 * and the CRM (go.onrol.in/api/public/leads) validates it per country.
 * With `name`, a hidden input carries the combined value so FormData-based forms
 * work unchanged.
 */

// [dial code, country name]. India first (default); the rest alphabetical.
export const COUNTRIES: [string, string][] = [
  ["91", "India"],
  ["93", "Afghanistan"], ["355", "Albania"], ["213", "Algeria"], ["54", "Argentina"], ["374", "Armenia"],
  ["61", "Australia"], ["43", "Austria"], ["994", "Azerbaijan"], ["973", "Bahrain"], ["880", "Bangladesh"],
  ["375", "Belarus"], ["32", "Belgium"], ["975", "Bhutan"], ["591", "Bolivia"], ["387", "Bosnia"],
  ["267", "Botswana"], ["55", "Brazil"], ["673", "Brunei"], ["359", "Bulgaria"], ["855", "Cambodia"],
  ["237", "Cameroon"], ["1", "Canada / USA"], ["56", "Chile"], ["86", "China"], ["57", "Colombia"],
  ["506", "Costa Rica"], ["385", "Croatia"], ["357", "Cyprus"], ["420", "Czechia"], ["45", "Denmark"],
  ["593", "Ecuador"], ["20", "Egypt"], ["372", "Estonia"], ["251", "Ethiopia"], ["358", "Finland"],
  ["33", "France"], ["995", "Georgia"], ["49", "Germany"], ["233", "Ghana"], ["30", "Greece"],
  ["852", "Hong Kong"], ["36", "Hungary"], ["354", "Iceland"], ["62", "Indonesia"], ["98", "Iran"],
  ["964", "Iraq"], ["353", "Ireland"], ["972", "Israel"], ["39", "Italy"], ["81", "Japan"],
  ["962", "Jordan"], ["7", "Kazakhstan / Russia"], ["254", "Kenya"], ["965", "Kuwait"], ["996", "Kyrgyzstan"],
  ["856", "Laos"], ["371", "Latvia"], ["961", "Lebanon"], ["370", "Lithuania"], ["352", "Luxembourg"],
  ["853", "Macau"], ["60", "Malaysia"], ["960", "Maldives"], ["356", "Malta"], ["230", "Mauritius"],
  ["52", "Mexico"], ["976", "Mongolia"], ["212", "Morocco"], ["258", "Mozambique"], ["95", "Myanmar"],
  ["264", "Namibia"], ["977", "Nepal"], ["31", "Netherlands"], ["64", "New Zealand"], ["234", "Nigeria"],
  ["47", "Norway"], ["968", "Oman"], ["92", "Pakistan"], ["970", "Palestine"], ["507", "Panama"],
  ["51", "Peru"], ["63", "Philippines"], ["48", "Poland"], ["351", "Portugal"], ["974", "Qatar"],
  ["40", "Romania"], ["966", "Saudi Arabia"], ["221", "Senegal"], ["381", "Serbia"], ["65", "Singapore"],
  ["421", "Slovakia"], ["386", "Slovenia"], ["27", "South Africa"], ["82", "South Korea"], ["34", "Spain"],
  ["94", "Sri Lanka"], ["249", "Sudan"], ["46", "Sweden"], ["41", "Switzerland"], ["886", "Taiwan"],
  ["255", "Tanzania"], ["66", "Thailand"], ["216", "Tunisia"], ["90", "Turkey"], ["256", "Uganda"],
  ["380", "Ukraine"], ["971", "UAE"], ["44", "United Kingdom"], ["598", "Uruguay"], ["998", "Uzbekistan"],
  ["58", "Venezuela"], ["84", "Vietnam"], ["967", "Yemen"], ["260", "Zambia"], ["263", "Zimbabwe"],
];

const DIALS = [...new Set(COUNTRIES.map(([d]) => d))].sort((a, b) => b.length - a.length);

/** Split "+44 7911 123456" into { dial: "44", number: "7911 123456" }. */
function parse(value: string): { dial: string; number: string } {
  const v = (value ?? "").trim();
  if (!v.startsWith("+")) return { dial: "91", number: v };
  const digits = v.slice(1).replace(/\D/g, "");
  const dial = DIALS.find((d) => digits.startsWith(d)) ?? "91";
  // Keep the user's spacing in the number part where possible.
  const rest = v.slice(1).replace(new RegExp(`^\\s*${dial.split("").join("\\s*")}`), "").trim();
  return { dial, number: rest };
}

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  /** When set, a hidden input with this name carries the combined value. */
  name?: string;
  required?: boolean;
  /** Classes for BOTH the code select and the number input - pass the form's input class. */
  className?: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

export function PhoneInput({
  value, onChange, name, required, className = "", placeholder = "98765 43210", id, disabled,
}: PhoneInputProps) {
  const initial = useMemo(() => parse(value), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [dial, setDial] = useState(initial.dial);
  const [number, setNumber] = useState(initial.number);

  // Follow external resets (form cleared / prefilled) without fighting typing.
  useEffect(() => {
    const p = parse(value);
    const combined = number.trim() ? `+${dial} ${number.trim()}` : "";
    if (value !== combined && (value.trim() === "" || value.trim() === `+${dial}` || p.number)) {
      setDial(p.dial);
      setNumber(p.number);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emit = (d: string, n: string) => onChange(n.trim() ? `+${d} ${n.trim()}` : "");
  const combined = number.trim() ? `+${dial} ${number.trim()}` : "";

  return (
    <div className="flex w-full gap-2">
      <select
        aria-label="Country code"
        value={dial}
        disabled={disabled}
        onChange={(e) => { setDial(e.target.value); emit(e.target.value, number); }}
        className={`${className} !w-[7.5rem] shrink-0 !px-2`}
      >
        {COUNTRIES.map(([d, n], i) => (
          <option key={`${d}-${i}`} value={d}>{`+${d} ${n}`}</option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        aria-label="Phone number"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={number}
        onChange={(e) => { setNumber(e.target.value); emit(dial, e.target.value); }}
        className={`${className} min-w-0 flex-1`}
      />
      {name ? <input type="hidden" name={name} value={combined} /> : null}
    </div>
  );
}

export default PhoneInput;
