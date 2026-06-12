;; Config updated 2026-06-12T18:20:50Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u46)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
