package nss

default allow = false

allow {
  input.has_consent
  not deny_minor
}

deny_minor {
  input.is_minor
  not input.guardian_token_present
}


