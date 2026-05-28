;; Config updated 2026-05-28T08:30:08Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u6)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
