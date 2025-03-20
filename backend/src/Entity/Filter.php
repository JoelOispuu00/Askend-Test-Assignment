<?php

namespace App\Entity;

use App\Repository\FilterRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: FilterRepository::class)]
class Filter
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups("filter:read")]
    private ?int $id = null;

    #[ORM\Column(type: "string", length: 255)]
    #[Groups("filter:read")] // Add a group to specify serialization
    private string $name;

    #[ORM\OneToMany(targetEntity: Criteria::class, mappedBy: "filter", cascade: ["persist", "remove"])]
    #[Groups("filter:read")]
    private Collection $criteria;

    #[ORM\Column(type: "integer")]
    #[Groups("filter:read")]
    #[Assert\Choice(choices: [1, 2, 3], message: "Selection must be 1, 2, or 3.")]
    private int $selection = 1;

    public function __construct()
    {
        $this->criteria = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getCriteria(): Collection
    {
        return $this->criteria;
    }

    public function addCriteria(Criteria $criteria): self
    {
        if (!$this->criteria->contains($criteria)) {
            $this->criteria[] = $criteria;
            $criteria->setFilter($this);
        }

        return $this;
    }

    public function removeCriteria(Criteria $criteria): self
    {
        if ($this->criteria->contains($criteria)) {
            $this->criteria->removeElement($criteria);
            if ($criteria->getFilter() === $this) {
                $criteria->setFilter(null);
            }
        }

        return $this;
    }

    public function getSelection(): int
    {
        return $this->selection;
    }

    public function setSelection(int $selection): self
    {
        if (!in_array($selection, [1, 2, 3])) {
            throw new \InvalidArgumentException("Selection must be 1, 2, or 3.");
        }

        $this->selection = $selection;
        return $this;
    }
}