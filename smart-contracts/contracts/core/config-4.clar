;; Config updated 2026-05-30T19:48:06Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u51)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
