;; Config updated 2026-06-17T06:36:57Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u21)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
