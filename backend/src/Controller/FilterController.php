<?php
namespace App\Controller;

use App\Entity\Filter;
use App\Entity\Criteria;
use App\Repository\FilterRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\Common\Collections\ArrayCollection;

class FilterController extends AbstractController
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('/api/filters', name: 'get_filters', methods: ['GET'])]
    public function getFilters(FilterRepository $filterRepository, SerializerInterface $serializer)
    {
        $filters = $filterRepository->createQueryBuilder('f')
            ->leftJoin('f.criteria', 'c')
            ->addSelect('c')
            ->getQuery()
            ->getResult();
    
        $normalizedFilters = $serializer->normalize($filters, null, ['groups' => 'filter:read', 'enable_max_depth' => true]);

        return new JsonResponse($normalizedFilters);
    }

    #[Route('/api/filters', name: 'create_filter', methods: ['POST'])]
    public function createFilter(Request $request, SerializerInterface $serializer)
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['name']) || !isset($data['criteria']) || !is_array($data['criteria']) || !isset($data['selection'])) {
            return new JsonResponse(['error' => 'Invalid data, criteria must be an array'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $filter = new Filter();
        $filter->setName($data['name']);
        $filter->setSelection($data['selection']);

        foreach ($data['criteria'] as $criteriaData) {
            if (!in_array($criteriaData['type'], ['Amount', 'Title', 'Date'])) {
                return new JsonResponse(['error' => 'Invalid criteria type'], JsonResponse::HTTP_BAD_REQUEST);
            }

            if (!isset($criteriaData['selection'])) {
                return new JsonResponse(['error' => 'Selection field is required for each criterion'], JsonResponse::HTTP_BAD_REQUEST);
            }

            $validOperators = [];
            if ($criteriaData['type'] === 'Amount') {
                $validOperators = ['equals', 'greater_than', 'less_than'];
            } elseif ($criteriaData['type'] === 'Title') {
                $validOperators = ['contains', 'starts_with', 'ends_with'];
            } elseif ($criteriaData['type'] === 'Date') {
                $validOperators = ['from', 'to'];
            }

            if (!in_array($criteriaData['operator'], $validOperators)) {
                return new JsonResponse(['error' => 'Invalid operator for this type'], JsonResponse::HTTP_BAD_REQUEST);
            }

            $criteria = new Criteria();
            $criteria->setType($criteriaData['type']);
            $criteria->setSelection($criteriaData['selection']);
            $criteria->setValue($criteriaData['value'] ?? null);
            $criteria->setOperator($criteriaData['operator'] ?? null);

            $filter->addCriteria($criteria);
        }

        $this->entityManager->persist($filter);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Filter created', 'filterId' => $filter->getId()], JsonResponse::HTTP_CREATED);
    }

    #[Route('/api/filters/{filterId}', name: 'delete_filter', methods: ['DELETE'])]
    public function deleteFilter(int $filterId, FilterRepository $filterRepository): JsonResponse
    {
        $filter = $filterRepository->find($filterId);

        if (!$filter) {
            return new JsonResponse(['error' => 'Filter not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($filter);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Filter and its criteria deleted successfully'], JsonResponse::HTTP_OK);
    }

    #[Route('/api/filters/{filterId}', name: 'update_filter', methods: ['PUT'])]
    public function updateFilter(int $filterId, Request $request, FilterRepository $filterRepository): JsonResponse
    {
        $filter = $filterRepository->find($filterId);

        if (!$filter) {
            return new JsonResponse(['error' => 'Filter not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['name']) || !isset($data['criteria']) || !is_array($data['criteria'])) {
            return new JsonResponse(['error' => 'Invalid data, criteria must be an array'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $filter->setName($data['name']);
        $filter->setSelection($data['selection']);

        foreach ($filter->getCriteria() as $existingCriteria) {
            $this->entityManager->remove($existingCriteria);
        }

        foreach ($data['criteria'] as $criteriaData) {
            if (!in_array($criteriaData['type'], ['Amount', 'Title', 'Date'])) {
                return new JsonResponse(['error' => 'Invalid criteria type'], JsonResponse::HTTP_BAD_REQUEST);
            }

            if (!isset($criteriaData['selection'])) {
                return new JsonResponse(['error' => 'Selection field is required for each criterion'], JsonResponse::HTTP_BAD_REQUEST);
            }

            $validOperators = [];
            if ($criteriaData['type'] === 'Amount') {
                $validOperators = ['equals', 'greater_than', 'less_than'];
            } elseif ($criteriaData['type'] === 'Title') {
                $validOperators = ['contains', 'starts_with', 'ends_with'];
            } elseif ($criteriaData['type'] === 'Date') {
                $validOperators = ['from', 'to'];
            }

            if (!in_array($criteriaData['operator'], $validOperators)) {
                return new JsonResponse(['error' => 'Invalid operator for this type'], JsonResponse::HTTP_BAD_REQUEST);
            }

            $criteria = new Criteria();
            $criteria->setType($criteriaData['type']);
            $criteria->setSelection($criteriaData['selection']);
            $criteria->setValue($criteriaData['value'] ?? null);
            $criteria->setOperator($criteriaData['operator'] ?? null);

            $filter->addCriteria($criteria);
        }

        $this->entityManager->persist($filter);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Filter updated successfully'], JsonResponse::HTTP_OK);
    }
}