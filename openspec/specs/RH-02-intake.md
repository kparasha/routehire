# RH-02 Phone-first intake

## Capability
Build a candidate profile via questionnaire — **no resume required**. Talent pool opt-in **default on** with T&C.

## Flow
1. Terms + pre-checked opt-in
2. One question per screen (ZIP, CDL, endorsements, years, role, schedule, pay, contact)
3. Server builds `generated_resume_json` + `resume_text`
4. Match to demand; show skill gaps / training

## API
- `POST /intake/sessions`
- `PATCH /intake/sessions/{id}`
- `POST /intake/sessions/{id}/complete`

## Acceptance
- Playwright: complete intake without uploading a resume
- `opt_in_talent_pool: false` → not on hauler shortlist
